import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/redis";
import { ALL_MOCK_SONGS } from "@/lib/api";

export async function GET() {
  const cacheKey = "music:trending";

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
    await setCache(cacheKey, ALL_MOCK_SONGS, 3600);
  } catch (err) {
    // Graceful silent bypass
  }

  return NextResponse.json(ALL_MOCK_SONGS);
}
