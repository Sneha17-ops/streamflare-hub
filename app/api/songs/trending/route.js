import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/redis";
import { ALL_MOCK_SONGS } from "@/lib/api";

// Jamendo free public API – no auth required for basic track listing
const JAMENDO_URL =
  "https://api.jamendo.com/v3.0/tracks/?client_id=b6747d04&format=json&limit=50&audioformat=mp32&order=popularity_total&include=musicinfo";

function jamendoToSong(track, index) {
  return {
    id: `jmd_${track.id}`,
    title: track.name,
    artist: track.artist_name,
    album: track.album_name || "Jamendo",
    duration: String(track.duration || 200),
    cover: track.image || `/assets/m${(index % 10) + 1}.jpg`,
    audioUrl: track.audio,
    language: "English",
  };
}

export async function GET() {
  const cacheKey = "music:trending:v3";

  // 1. Try Redis cache first
  try {
    const cached = await getCache(cacheKey);
    if (cached) return NextResponse.json(cached);
  } catch (_) {}

  // 2. Try Jamendo live API to get real streamable tracks
  try {
    const res = await fetch(JAMENDO_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      const jamendoTracks = (data.results || [])
        .filter((t) => t.audio)
        .map(jamendoToSong);

      if (jamendoTracks.length > 0) {
        // Merge Jamendo live tracks with our curated mock catalog
        const merged = [...ALL_MOCK_SONGS, ...jamendoTracks];
        try { await setCache(cacheKey, merged, 3600); } catch (_) {}
        return NextResponse.json(merged);
      }
    }
  } catch (_) {
    // Jamendo unreachable – fall back to mock catalog
  }

  // 3. Graceful fallback to our 75+ song mock catalog
  try { await setCache(cacheKey, ALL_MOCK_SONGS, 1800); } catch (_) {}
  return NextResponse.json(ALL_MOCK_SONGS);
}
