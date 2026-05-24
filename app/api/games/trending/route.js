import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/redis";
import { MOCK_GAMES } from "@/lib/api";

const RAWG_API_KEY = process.env.RAWG_API_KEY || "";
const RAWG_BASE_URL = "https://api.rawg.io/api";

export async function GET() {
  const cacheKey = "games:trending";

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    if (RAWG_API_KEY) {
      const res = await fetch(`${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&ordering=-rating&page_size=10`);
      const data = await res.json();
      const formatted = data.results.map((g) => ({
        id: g.id.toString(),
        title: g.name,
        description: "Dive into this modern, highly praised AAA gameplay environment packed with outstanding visuals.",
        cover: g.background_image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
        category: g.genres?.map((x) => x.name).join(" / ") || "Adventure",
        rating: g.rating || 4.2,
        gameUrl: `https://rawg.io/games/${g.slug || g.name.toLowerCase().replace(/\s+/g, "-")}`,
        videoPreview: g.clip?.clip || "https://www.w3schools.com/html/mov_bbb.mp4",
        isLegacy: false
      }));

      const combined = [...MOCK_GAMES.filter(x => x.isLegacy), ...formatted];
      await setCache(cacheKey, combined, 3600);
      return NextResponse.json(combined);
    }
  } catch (err) {
    // Silent bypass
  }

  return NextResponse.json(MOCK_GAMES);
}
