import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/redis";
import { dbConnect } from "@/lib/mongodb";
import LeaderboardEntry from "@/lib/models/LeaderboardEntry";

const FALLBACK = [
  { userId: "u1", name: "Nova Byte", badge: "Platinum Curator", city: "Mumbai", xp: 9820, tier: "Platinum", weekXp: 1240, monthXp: 3820, allTimeXp: 9820, wins: 22, badges: ["Melody King", "Arcade Architect"] },
  { userId: "u2", name: "Elena Flux", badge: "AI DJ", city: "Seoul", xp: 9410, tier: "Platinum", weekXp: 1160, monthXp: 3410, allTimeXp: 9410, wins: 18, badges: ["Room Host", "Watch Party Pro"] },
  { userId: "u3", name: "Kai Mercer", badge: "Cinematic Runner", city: "London", xp: 9040, tier: "Gold", weekXp: 1030, monthXp: 3040, allTimeXp: 9040, wins: 16, badges: ["Explorer", "Speedrun"] },
  { userId: "u4", name: "Asha Ray", badge: "Mood Curator", city: "Bengaluru", xp: 8760, tier: "Gold", weekXp: 990, monthXp: 2860, allTimeXp: 8760, wins: 15, badges: ["Mood Master", "Trend Hunter"] },
  { userId: "u5", name: "Milo Zenith", badge: "Neon Captain", city: "Toronto", xp: 8310, tier: "Gold", weekXp: 880, monthXp: 2510, allTimeXp: 8310, wins: 14, badges: ["Arcade Veteran", "Community Star"] },
];

function normalize(entries, period) {
  return entries
    .map((entry, index) => ({
      ...entry,
      xp: period === "weekly" ? entry.weekXp || entry.xp : period === "monthly" ? entry.monthXp || entry.xp : entry.allTimeXp || entry.xp,
      rank: index + 1,
    }))
    .sort((a, b) => b.xp - a.xp)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

function mergeWithFallback(docs) {
  const seen = new Set();
  return [...docs, ...FALLBACK].filter((entry) => {
    if (seen.has(entry.userId)) return false;
    seen.add(entry.userId);
    return true;
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "all-time";
  const cacheKey = `leaderboard:${period}`;

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
  } catch (error) {
    // Cache is optional.
  }

  try {
    await dbConnect();
    const docs = await LeaderboardEntry.find().sort({ xp: -1 }).limit(20).lean();
    const payload = normalize(mergeWithFallback(docs).slice(0, 20), period);
    if (payload.length > 0) {
      await setCache(cacheKey, payload, 180).catch(() => {});
      return NextResponse.json(payload);
    }
  } catch (error) {
    // Database is optional.
  }

  const payload = normalize(FALLBACK, period);
  await setCache(cacheKey, payload, 180).catch(() => {});
  return NextResponse.json(payload);
}
