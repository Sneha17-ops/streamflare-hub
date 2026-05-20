import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/redis";
import { MOCK_MOVIES } from "@/lib/api";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function fetchTmdbMovies(endpoint) {
  const res = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((m) => ({
    id: m.id.toString(),
    title: m.title || m.name,
    description: m.overview,
    backdrop_path: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : "/assets/hero-bg.jpg",
    poster_path: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "/assets/movie1.webp",
    vote_average: m.vote_average,
    release_date: m.release_date || m.first_air_date,
    genre: "Action / Drama / Thriller",
    runtime: "120 min",
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }));
}

export async function GET() {
  const cacheKey = "movies:trending";

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    if (TMDB_API_KEY) {
      const combined = await Promise.all([
        fetchTmdbMovies("/trending/movie/week"),
        fetchTmdbMovies("/movie/now_playing"),
        fetchTmdbMovies("/movie/top_rated"),
        fetchTmdbMovies("/movie/upcoming")
      ]);

      const formatted = combined.flat().filter((movie, index, array) => array.findIndex((item) => item.id === movie.id) === index);

      await setCache(cacheKey, formatted, 3600);
      return NextResponse.json(formatted);
    }
  } catch (err) {
    // Silent fail to mock fallbacks
  }

  return NextResponse.json(MOCK_MOVIES);
}
