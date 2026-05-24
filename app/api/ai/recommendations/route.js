import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/redis";
import { generateMoodRecommendations } from "@/lib/streamflare-ai";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get("mood") || "Chill";
  const query = searchParams.get("query") || "";
  const context = {
    favorites: JSON.parse(searchParams.get("favorites") || "[]"),
    recent: JSON.parse(searchParams.get("recent") || "[]"),
    genres: JSON.parse(searchParams.get("genres") || "[]"),
  };
  const cacheKey = `ai:recommendations:${mood}:${query}`;

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
  } catch (error) {
    // Cache is optional.
  }

  const payload = await generateMoodRecommendations(mood, query, context);

  try {
    await setCache(cacheKey, payload, 900);
  } catch (error) {
    // Cache is optional.
  }

  return NextResponse.json(payload);
}
