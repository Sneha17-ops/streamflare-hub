import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/redis";
import { generateSemanticSearchResults } from "@/lib/streamflare-ai";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const context = {
    favorites: JSON.parse(searchParams.get("favorites") || "[]"),
    recent: JSON.parse(searchParams.get("recent") || "[]"),
    genres: JSON.parse(searchParams.get("genres") || "[]"),
  };
  const cacheKey = `semantic-search:${query}`;

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
  } catch (error) {
    // Continue without cache.
  }

  const payload = await generateSemanticSearchResults(query, context);

  try {
    await setCache(cacheKey, payload, 300);
  } catch (error) {
    // Continue without cache.
  }

  return NextResponse.json(payload);
}
