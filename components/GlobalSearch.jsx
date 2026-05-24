"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Search, X, Film, Music, Gamepad2, Play, Sparkles, BrainCircuit, Loader2 } from "lucide-react";
import { useSearchStore, useMusicStore, useUserStore } from "../store";
import BlurImage from "./BlurImage";
import ArcadeModal from "./ArcadeModal";

const TRENDING_QUERIES = ["emotional sci-fi movies", "relaxing late night songs", "multiplayer action games", "dark psychological thrillers"];

export default function GlobalSearch() {
  const { isOpen, setIsOpen, query, setQuery } = useSearchStore();
  const setCurrentTrack = useMusicStore((state) => state.setCurrentTrack);
  const addRecentlyPlayed = useUserStore((state) => state.addRecentlyPlayed);

  const recognitionRef = useRef(null);
  const [activeArcadeGame, setActiveArcadeGame] = useState(null);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({ movies: [], songs: [], games: [], mood: null, explanation: "" });

  const hasQuery = Boolean(query.trim());
  const headline = useMemo(() => payload?.explanation || "Search the full ecosystem with semantic intent.", [payload]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!hasQuery) {
        setPayload({ movies: [], songs: [], games: [], mood: null, explanation: "Type a phrase and let the AI interpret the intent." });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search/semantic?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setPayload(data);
      } catch (error) {
        setPayload({ movies: [], songs: [], games: [], mood: null, explanation: "Search temporarily fell back to local mode." });
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [hasQuery, query]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  // AI Speech Synthesis back-talk engine
  const speakBack = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.15;
    // Prefer a clear, natural English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Zira") || v.name.includes("Samantha"))
    );
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      if (!transcript) { setListening(false); return; }

      const cmd = transcript.toLowerCase();

      // Intent-based voice command routing
      if (cmd.includes("close") || cmd.includes("exit") || cmd.includes("dismiss")) {
        speakBack("Closing AI Search");
        setQuery("");
        setTimeout(() => setIsOpen(false), 700);
      } else if (cmd.startsWith("play") || cmd.includes("play song") || cmd.includes("play music")) {
        const searchTerm = transcript.replace(/play\s*(song|music)?/i, "").trim();
        speakBack(`Finding ${searchTerm || "something good"} for you`);
        setQuery(searchTerm || "trending songs");
      } else if (cmd.startsWith("search") || cmd.startsWith("find") || cmd.startsWith("show")) {
        const searchTerm = transcript.replace(/^(search|find|show)\s*/i, "").trim();
        speakBack(`Searching for ${searchTerm}`);
        setQuery(searchTerm);
      } else if (cmd.includes("lounge") || cmd.includes("room") || cmd.includes("listening")) {
        speakBack("Opening your listening lounge");
        setTimeout(() => { setIsOpen(false); window.location.href = "/rooms"; }, 800);
      } else if (cmd.includes("movies") || cmd.includes("cinema")) {
        speakBack("Taking you to cinema");
        setTimeout(() => { setIsOpen(false); window.location.href = "/movies"; }, 800);
      } else if (cmd.includes("games") || cmd.includes("arcade")) {
        speakBack("Loading the arcade");
        setTimeout(() => { setIsOpen(false); window.location.href = "/arcade"; }, 800);
      } else {
        speakBack(`Looking up ${transcript}`);
        setQuery(transcript);
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
  }, [setQuery, setIsOpen]);

  const toggleVoiceSearch = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }
    try {
      recognition.start();
      setListening(true);
      speakBack("Listening. What would you like?");
    } catch (error) {
      setListening(false);
    }
  };

  const handleMoviePlay = (movie) => {
    addRecentlyPlayed({ id: movie.id, type: "movie", title: movie.title, cover: movie.poster_path });
    setIsOpen(false);
    window.location.href = `/movies/${movie.id}`;
  };

  const handleSongPlay = (song) => {
    setCurrentTrack(song);
    addRecentlyPlayed({ id: song.id, type: "song", title: song.title, cover: song.cover });
    setIsOpen(false);
  };

  const handleGamePlay = (game) => {
    addRecentlyPlayed({ id: game.id, type: "game", title: game.title, cover: game.cover });
    if (game.isLegacy) {
      setActiveArcadeGame({ url: game.gameUrl, title: game.title });
    } else {
      window.open(game.gameUrl, "_blank");
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#020617]/95 px-6 py-8 backdrop-blur-2xl md:px-24 md:py-16"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-cyan-400">
                <BrainCircuit className="h-4 w-4" />
                <span>Semantic AI Search</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-full border border-slate-800 bg-slate-900 p-2.5 text-slate-300 smooth-transition hover:border-red-500 hover:text-red-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mx-auto mt-8 w-full max-w-5xl space-y-5">
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={listening ? "Listening… speak your command" : "Try: relaxing late night songs"}
                  className={`w-full rounded-3xl border bg-slate-900/50 py-5 pl-16 pr-16 text-lg font-medium text-white outline-none transition-all duration-300 placeholder:text-slate-500 ${
                    listening
                      ? "border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.25)] placeholder:text-rose-400/70"
                      : "border-slate-800 focus:border-cyan-400/50 focus:shadow-[0_0_30px_rgba(34,211,238,0.18)]"
                  }`}
                />
                <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <button onClick={toggleVoiceSearch} className={`absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border transition ${listening ? "border-rose-400 bg-rose-500/15 text-rose-300" : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40 hover:text-white"}`}>
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>

              {/* Siri-style animated listening orb */}
              <AnimatePresence>
                {listening && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-5 rounded-3xl border border-rose-500/20 bg-rose-500/5 px-5 py-4 backdrop-blur-xl"
                  >
                    {/* Pulsing orb */}
                    <div className="relative flex-shrink-0">
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.4 }}
                        className="absolute inset-0 rounded-full bg-rose-500/40"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
                        transition={{ repeat: Infinity, duration: 1.0 }}
                        className="absolute inset-0 rounded-full bg-rose-400/30"
                      />
                      <div className="relative h-10 w-10 flex items-center justify-center rounded-full bg-rose-500/20 border border-rose-500/40">
                        <Mic className="h-5 w-5 text-rose-300" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-rose-300">AI Assistant is listening…</p>
                      <p className="mt-0.5 text-xs text-slate-400">Try: &quot;play romantic songs&quot; · &quot;open lounge&quot; · &quot;close&quot;</p>
                    </div>
                    {/* Animated sound-wave bars */}
                    <div className="flex items-end gap-0.5 h-6">
                      {[3,5,8,5,7,4,6,3,5,8].map((h, i) => (
                        <motion.span
                          key={i}
                          animate={{ height: [h, h + 6, h + 2, h] }}
                          transition={{ repeat: Infinity, duration: 0.7 + i * 0.08, ease: "easeInOut" }}
                          className="w-0.5 rounded-full bg-rose-400"
                          style={{ height: h }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap items-center gap-2">
                {/* Voice command hints */}
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mr-1">Try:</span>
                {TRENDING_QUERIES.map((item) => (
                  <button key={item} onClick={() => setQuery(item)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white">
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{headline}</p>
                  <p className="text-xs text-slate-500">Voice commands: &quot;play…&quot; · &quot;search…&quot; · &quot;open lounge&quot; · &quot;close&quot;</p>
                </div>
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-cyan-300" /> : null}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mt-6">
              {(payload.movies?.length > 0 || payload.songs?.length > 0 || payload.games?.length > 0) && (
                <div className="mx-auto max-w-6xl mb-4 flex items-center gap-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Results</span>
                  <div className="flex items-center gap-2">
                    {payload.movies?.length > 0 && <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-300">{payload.movies.length} movies</span>}
                    {payload.songs?.length > 0 && <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300">{payload.songs.length} songs</span>}
                    {payload.games?.length > 0 && <span className="rounded-full border border-pink-500/30 bg-pink-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-pink-300">{payload.games.length} games</span>}
                  </div>
                </div>
              )}
              <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
                <ResultColumn label="Movies" accent="purple" icon={Film} items={payload.movies || []} onPick={handleMoviePlay} renderMeta={(item) => item.genre || item.vote_average} />
                <ResultColumn label="Songs" accent="cyan" icon={Music} items={payload.songs || []} onPick={handleSongPlay} renderMeta={(item) => item.artist || item.album} />
                <ResultColumn label="Games" accent="pink" icon={Gamepad2} items={payload.games || []} onPick={handleGamePlay} renderMeta={(item) => item.category || item.rating} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeArcadeGame ? <ArcadeModal isOpen onClose={() => setActiveArcadeGame(null)} gameUrl={activeArcadeGame.url} gameTitle={activeArcadeGame.title} /> : null}
    </>
  );
}

function ResultColumn({ label, accent, icon: Icon, items, onPick, renderMeta }) {
  const accentClass = accent === "cyan" ? "text-cyan-400" : accent === "pink" ? "text-pink-400" : "text-purple-400";

  return (
    <div className="space-y-4">
      <h4 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${accentClass} font-mono`}>
        <Icon className="h-4 w-4" />
        <span>{label} ({items.length})</span>
      </h4>
      <div className="space-y-3">
        {items.length > 0 ? items.map((item, index) => (
          <motion.button
            key={item.id ?? `${label}-${index}`}
            whileHover={{ y: -2 }}
            onClick={() => onPick(item)}
            className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-white/20 hover:bg-white/10"
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900">
              <BlurImage src={item.poster_path || item.cover || "/assets/movie1.webp"} alt={item.title} width={56} height={56} className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="truncate text-sm font-bold text-white">{item.title}</h5>
              <p className="truncate text-xs text-slate-400">{renderMeta(item)}</p>
              <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{item.description || item.album || item.category}</p>
            </div>
          </motion.button>
        )) : <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-xs text-slate-500">No matches yet. Type a richer prompt for the AI engine.</div>}
      </div>
    </div>
  );
}
