import { ALL_MOCK_SONGS, MOCK_GAMES, MOCK_MOVIES } from "./api";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_BASE_URL = "https://api.openai.com/v1/chat/completions";

const MOOD_LIBRARY = {
  Happy: {
    label: "Happy",
    tone: "radiant",
    description: "Bright, contagious energy with glossy hook-filled entertainment.",
    colors: "from-amber-400 via-orange-400 to-pink-500",
    keywords: ["uplifting", "celebration", "joy", "bright", "dance", "comedy", "feel good"],
    genres: ["Comedy", "Adventure", "Family", "Pop", "Party", "Arcade"],
  },
  Sad: {
    label: "Sad",
    tone: "blue",
    description: "Reflective stories and emotionally rich soundscapes for quiet moments.",
    colors: "from-sky-400 via-indigo-500 to-slate-600",
    keywords: ["melancholy", "heartbreak", "reflective", "tearful", "lonely", "longing"],
    genres: ["Drama", "Romance", "Acoustic", "Soul", "Indie"],
  },
  Romantic: {
    label: "Romantic",
    tone: "rose",
    description: "Warm, intimate, and cinematic mood pieces made for two.",
    colors: "from-rose-400 via-fuchsia-500 to-pink-500",
    keywords: ["love", "romance", "slow burn", "heart", "intimate", "tender"],
    genres: ["Romance", "Drama", "Love", "Ballad"],
  },
  Action: {
    label: "Action",
    tone: "crimson",
    description: "High-voltage spectacle, heavy bass, and kinetic storytelling.",
    colors: "from-red-500 via-orange-500 to-amber-400",
    keywords: ["explosive", "combat", "thriller", "combat", "combat", "punch", "battle", "intense"],
    genres: ["Action", "Thriller", "Shooter", "RPG", "Beat 'em up"],
  },
  Chill: {
    label: "Chill",
    tone: "teal",
    description: "Soft-focus playlists and low-friction stories for late-night flow.",
    colors: "from-cyan-400 via-teal-400 to-emerald-400",
    keywords: ["calm", "easy", "lounge", "ambient", "lofi", "soft"],
    genres: ["Ambient", "Lo-fi", "Drama", "Simulation"],
  },
  Horror: {
    label: "Horror",
    tone: "violet",
    description: "Shadow-heavy, suspense-first content with sharp atmospheric tension.",
    colors: "from-violet-500 via-purple-700 to-slate-900",
    keywords: ["fear", "creepy", "nightmare", "dark", "gothic", "suspense"],
    genres: ["Horror", "Thriller", "Mystery", "Dark"],
  },
  Emotional: {
    label: "Emotional",
    tone: "indigo",
    description: "Tender, high-stakes stories and cathartic soundtracks that linger.",
    colors: "from-indigo-400 via-purple-500 to-rose-500",
    keywords: ["emotional", "cathartic", "moving", "loss", "hope", "human"],
    genres: ["Drama", "Score", "Ballad", "Biography"],
  },
  Motivational: {
    label: "Motivational",
    tone: "emerald",
    description: "Momentum-building stories, workout-ready tracks, and underdog wins.",
    colors: "from-emerald-400 via-cyan-500 to-blue-500",
    keywords: ["winning", "inspire", "rise", "discipline", "focus", "grind"],
    genres: ["Biography", "Sports", "Workout", "Rock", "Action"],
  },
  Party: {
    label: "Party",
    tone: "gold",
    description: "Big bass, social energy, and multiplayer experiences that keep rooms alive.",
    colors: "from-yellow-400 via-orange-500 to-red-500",
    keywords: ["party", "club", "dance", "festival", "crowd", "anthem"],
    genres: ["Dance", "Pop", "Electronic", "Arcade", "Multiplayer"],
  },
  Relaxing: {
    label: "Relaxing",
    tone: "mist",
    description: "Slow textures, meditative visuals, and content that clears the noise.",
    colors: "from-slate-300 via-cyan-300 to-teal-300",
    keywords: ["relax", "peace", "calm", "breathing", "soothing", "rest"],
    genres: ["Ambient", "Meditation", "Chill", "Documentary"],
  },
};

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function scoreEntry(entry, tokens, fields = []) {
  const haystack = fields.map((field) => normalizeText(entry[field])).join(" ");
  return tokens.reduce((score, token) => {
    if (!token) return score;
    if (haystack.includes(token)) return score + 3;
    const segments = token.split(/\s+/).filter(Boolean);
    const bonus = segments.reduce((innerScore, segment) => (haystack.includes(segment) ? innerScore + 1 : innerScore), 0);
    return score + bonus;
  }, 0);
}

function applyContextBoost(entry, context = {}, type = "generic") {
  const boosts = [];
  const favoriteIds = new Set((context.favorites || []).map((item) => item.id));
  const recentIds = new Set((context.recent || []).map((item) => item.id));
  const preferredGenres = new Set((context.genres || []).map((item) => normalizeText(item)));
  const recentTitles = new Set((context.recent || []).map((item) => normalizeText(item.title)));

  if (favoriteIds.has(entry.id)) boosts.push(14);
  if (recentIds.has(entry.id)) boosts.push(10);

  const searchable = normalizeText(entry.genre || entry.category || entry.album || entry.language || "");
  preferredGenres.forEach((genre) => {
    if (searchable.includes(genre)) boosts.push(4);
  });

  if (type !== "music" && recentTitles.has(normalizeText(entry.title))) {
    boosts.push(3);
  }

  return boosts.reduce((sum, value) => sum + value, 0);
}

function dedupeById(items) {
  return items.filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index);
}

async function generateNarrative({ type, mood, query, movies = [], songs = [], games = [] }) {
  if (!OPENAI_API_KEY) {
    return null;
  }

  const focus = [
    movies[0]?.title ? `movie: ${movies[0].title}` : null,
    songs[0]?.title ? `song: ${songs[0].title}` : null,
    games[0]?.title ? `game: ${games[0].title}` : null,
  ].filter(Boolean).join("; ");

  const prompt = type === "search"
    ? `Write 1 concise futuristic sentence that explains this semantic search result. Query: ${query}. Mood: ${mood.label}. Top matches: ${focus}.`
    : `Write 2 concise futuristic sentences that summarize this entertainment mood recommendation. Mood: ${mood.label}. Top matches: ${focus}. Tone: premium, cinematic, AI-native.`;

  try {
    const response = await fetch(OPENAI_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You write short, polished entertainment product copy." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 90,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (error) {
    return null;
  }
}

export function getMoodConfig(moodName) {
  return MOOD_LIBRARY[moodName] || MOOD_LIBRARY.Chill;
}

export function getMoodOptions() {
  return Object.values(MOOD_LIBRARY).map((mood) => ({
    ...mood,
    id: mood.label,
    emoji: mood.label === "Happy" ? "✨" : mood.label === "Sad" ? "🌧️" : mood.label === "Romantic" ? "💞" : mood.label === "Action" ? "⚡" : mood.label === "Chill" ? "🪐" : mood.label === "Horror" ? "🕯️" : mood.label === "Emotional" ? "🫧" : mood.label === "Motivational" ? "🏁" : mood.label === "Party" ? "🎉" : "🌙",
  }));
}

export async function generateMoodRecommendations(moodName, seedQuery = "", context = {}) {
  const mood = getMoodConfig(moodName);
  const tokens = [mood.label, ...mood.keywords, ...mood.genres, ...normalizeText(seedQuery).split(/\s+/)].filter(Boolean);

  const movieResults = dedupeById(
    [...MOCK_MOVIES]
      .map((movie) => ({
        ...movie,
        score: scoreEntry(movie, tokens, ["title", "description", "genre"]) + applyContextBoost(movie, context, "movie"),
      }))
      .sort((a, b) => b.score - a.score)
  ).slice(0, 6);

  const songResults = dedupeById(
    [...ALL_MOCK_SONGS]
      .map((song) => ({
        ...song,
        score: scoreEntry(song, tokens, ["title", "artist", "album", "language"]) + applyContextBoost(song, context, "music"),
      }))
      .sort((a, b) => b.score - a.score)
  ).slice(0, 8);

  const gameResults = dedupeById(
    [...MOCK_GAMES]
      .map((game) => ({
        ...game,
        score: scoreEntry(game, tokens, ["title", "description", "category"]) + applyContextBoost(game, context, "games"),
      }))
      .sort((a, b) => b.score - a.score)
  ).slice(0, 5);

  const description = (await generateNarrative({
    type: "mood",
    mood,
    query: seedQuery,
    movies: movieResults,
    songs: songResults,
    games: gameResults,
  })) || `The ${mood.label.toLowerCase()} signal maps to ${movieResults[0]?.title || "cinematic picks"}, ${songResults[0]?.title || "a tailored soundtrack"}, and ${gameResults[0]?.title || "a matching game loop"}.`;

  return {
    mood,
    description,
    movies: movieResults,
    songs: songResults,
    games: gameResults,
    highlights: {
      movie: movieResults[0] || null,
      song: songResults[0] || null,
      game: gameResults[0] || null,
    },
  };
}

export async function generateSemanticSearchResults(query, context = {}) {
  const normalized = normalizeText(query);
  const intentTokens = normalized.split(/\s+/).filter(Boolean);

  const moodMatch = Object.values(MOOD_LIBRARY).find((mood) => mood.keywords.some((keyword) => normalized.includes(keyword))) || MOOD_LIBRARY.Chill;

  const movieResults = MOCK_MOVIES
    .map((movie) => ({ ...movie, score: scoreEntry(movie, intentTokens.concat(moodMatch.keywords), ["title", "description", "genre"]) }))
    .map((movie) => ({ ...movie, score: movie.score + applyContextBoost(movie, context, "movie") }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const songResults = ALL_MOCK_SONGS
    .map((song) => ({ ...song, score: scoreEntry(song, intentTokens.concat(moodMatch.keywords), ["title", "artist", "album", "language"]) }))
    .map((song) => ({ ...song, score: song.score + applyContextBoost(song, context, "music") }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const gameResults = MOCK_GAMES
    .map((game) => ({ ...game, score: scoreEntry(game, intentTokens.concat(moodMatch.keywords), ["title", "description", "category"]) }))
    .map((game) => ({ ...game, score: game.score + applyContextBoost(game, context, "games") }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const intent = normalized.includes("movie") || normalized.includes("film") ? "movie" : normalized.includes("song") || normalized.includes("music") || normalized.includes("track") ? "music" : normalized.includes("game") || normalized.includes("multiplayer") ? "games" : "mixed";

  const explanation = (await generateNarrative({
    type: "search",
    mood: moodMatch,
    query,
    movies: movieResults,
    songs: songResults,
    games: gameResults,
  })) || `AI interpreted your request as a ${moodMatch.label.toLowerCase()} ${intent} search and pulled in the strongest semantic matches across the library.`;

  return {
    query,
    intent,
    mood: moodMatch,
    explanation,
    movies: movieResults,
    songs: songResults,
    games: gameResults,
  };
}

export function generateRoomCode(seed = "FLARE") {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${seed}-${suffix}`;
}

export function createRoomSnapshot(roomId) {
  const baseHash = Array.from(roomId || "ROOM").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const participants = [
    { id: `${roomId}-host`, name: "Ava", role: "Host", status: "Playing" },
    { id: `${roomId}-dj`, name: "Noah", role: "DJ", status: "Syncing" },
    { id: `${roomId}-guest`, name: "Mila", role: "Guest", status: "Listening" },
    { id: `${roomId}-fan`, name: "Kai", role: "Guest", status: "Reacting" },
  ];

  return {
    id: roomId,
    title: `Room ${roomId}`,
    description: "A premium synchronized listening space with live reactions, queue control, and presence-aware playback.",
    participants,
    messages: [
      { id: `${roomId}-msg-1`, author: "Ava", text: "Queue the next track after the chorus drop.", time: "00:12" },
      { id: `${roomId}-msg-2`, author: "Mila", text: "That bassline is insane.", time: "00:24" },
      { id: `${roomId}-msg-3`, author: "Noah", text: "Watch party sync is locked in.", time: "00:36" },
    ],
    reactions: ["🔥", "✨", "🎧", "💫"],
    playback: {
      trackTitle: "Midnight Aura",
      artist: "StreamFlare Collective",
      progress: (baseHash % 40) + 15,
      isPlaying: true,
    },
  };
}

export const THUMBNAIL_TEMPLATES = [
  {
    id: "poster-cinematic",
    title: "Cinematic Poster",
    description: "High-contrast poster with neon edge lighting and bold typography.",
  },
  {
    id: "social-banner",
    title: "Social Banner",
    description: "Wide banner with atmospheric overlays for shares and invites.",
  },
  {
    id: "short-thumb",
    title: "Short Thumbnail",
    description: "Compact thumbnail for feed cards, trailers, and promo carousels.",
  },
];

export function buildThumbnailPrompt(title, type, mood) {
  return `${type || "cinematic"} artwork for ${title}, mood: ${mood || "premium"}, luminous highlights, sharp typography, glassmorphism, futuristic entertainment branding`;
}

function extractJsonObject(text) {
  if (!text) return null;
  const trimmed = String(text).trim();
  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  const raw = fenced?.[1] || trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch (error) {
    return null;
  }
}

export async function generateThumbnailConcept({ title, type = "cinematic poster", mood = "premium", overlay = "", style = "glassmorphism" }) {
  const prompt = buildThumbnailPrompt(title, type, mood);
  const palette = mood === "Horror"
    ? ["#1f2937", "#4c1d95", "#f43f5e"]
    : mood === "Party"
      ? ["#f59e0b", "#ec4899", "#06b6d4"]
      : mood === "Relaxing"
        ? ["#0f172a", "#22d3ee", "#5eead4"]
        : ["#0f172a", "#06b6d4", "#ec4899"];

  const fallback = {
    headline: title || "Untitled Feature",
    subtitle: overlay || `${mood} energy for ${type}`,
    prompt,
    palette,
    composition: `${type} with centered title treatment, cinematic depth, and ${style} accents`,
    cta: `Generate ${title || "asset"}`,
    source: "deterministic",
  };

  if (!OPENAI_API_KEY) {
    return fallback;
  }

  try {
    console.log("generateThumbnailConcept: calling OpenAI", { title, type, mood, style });
    const response = await fetch(OPENAI_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You create short JSON thumbnail briefs for entertainment marketing assets." },
          {
            role: "user",
            content: `Return only JSON with keys headline, subtitle, prompt, palette, composition, cta. Title: ${title}. Type: ${type}. Mood: ${mood}. Overlay: ${overlay}. Style: ${style}. Use a premium cinematic tone.`,
          },
        ],
        temperature: 0.6,
        max_tokens: 180,
      }),
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "<no-body>");
      console.error("generateThumbnailConcept: OpenAI responded with non-ok", response.status, errText);
      return fallback;
    }

    const data = await response.json().catch((e) => {
      console.error("generateThumbnailConcept: failed to parse JSON from OpenAI", e);
      return null;
    });
    if (!data) {
      return fallback;
    }

    const content = data?.choices?.[0]?.message?.content;
    console.log("generateThumbnailConcept: OpenAI content:", String(content).slice(0, 1000));
    const parsed = extractJsonObject(content);
    if (!parsed) {
      console.error("generateThumbnailConcept: failed to extract JSON from content", { content });
      return fallback;
    }

    return {
      headline: parsed.headline || fallback.headline,
      subtitle: parsed.subtitle || fallback.subtitle,
      prompt: parsed.prompt || fallback.prompt,
      palette: Array.isArray(parsed.palette) && parsed.palette.length ? parsed.palette.slice(0, 3) : fallback.palette,
      composition: parsed.composition || fallback.composition,
      cta: parsed.cta || fallback.cta,
      source: "openai",
    };
  } catch (error) {
    console.error("generateThumbnailConcept: exception", String(error));
    return fallback;
  }
}
