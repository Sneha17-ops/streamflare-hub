import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/mongodb";
import UserProgress from "@/lib/models/UserProgress";
import LeaderboardEntry from "@/lib/models/LeaderboardEntry";
import { invalidateCache } from "@/lib/redis";

function computeRank(xp = 0) {
  if (xp >= 5000) return "Platinum";
  if (xp >= 2500) return "Gold";
  if (xp >= 1000) return "Silver";
  return "Bronze";
}

function computeTier(xp = 0) {
  if (xp >= 5000) return "Platinum";
  if (xp >= 2500) return "Gold";
  if (xp >= 1000) return "Silver";
  return "Bronze";
}

function normalizeDoc(doc, fallbackUserId) {
  const lean = doc?.toObject ? doc.toObject() : doc || {};
  return {
    userId: lean.userId || fallbackUserId,
    displayName: lean.displayName || lean.name || "StreamFlare User",
    favorites: lean.favorites || [],
    watchlist: lean.watchlist || [],
    recentlyPlayed: lean.recentlyPlayed || [],
    hoursWatched: lean.hoursWatched ?? lean.stats?.watchHours ?? 0,
    hoursPlayed: lean.hoursPlayed ?? lean.stats?.playHours ?? 0,
    xp: lean.xp || 0,
    level: lean.level || 1,
    badges: lean.badges || [],
    streak: lean.streak || 0,
    favoriteMood: lean.favoriteMood || "Chill",
  };
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const doc = await UserProgress.findOne({ userId });
    return NextResponse.json(normalizeDoc(doc, userId));
  } catch (err) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
}

export async function PUT(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    await dbConnect();

    const existing = await UserProgress.findOne({ userId });
    const favoriteIds = new Set((body.favorites || []).map((item) => item.id));
    const watchlistIds = new Set((body.watchlist || []).map((item) => item.id));
    const recentIds = new Set((body.recentlyPlayed || []).map((item) => item.id));

    const baseXp = existing?.xp || 0;
    const nextXp = baseXp + Math.round((body.favorites?.length || 0) * 12 + (body.watchlist?.length || 0) * 6 + (body.recentlyPlayed?.length || 0) * 4);
    const nextDoc = {
      userId,
      displayName: body.displayName || existing?.displayName || "StreamFlare User",
      favorites: Array.from(favoriteIds).map((id) => (body.favorites || []).find((item) => item.id === id)).filter(Boolean),
      watchlist: Array.from(watchlistIds).map((id) => (body.watchlist || []).find((item) => item.id === id)).filter(Boolean),
      recentlyPlayed: Array.from(recentIds).map((id) => (body.recentlyPlayed || []).find((item) => item.id === id)).filter(Boolean),
      hoursWatched: Number(body.hoursWatched || existing?.stats?.watchHours || 0),
      hoursPlayed: Number(body.hoursPlayed || existing?.stats?.playHours || 0),
      xp: nextXp,
      level: Math.max(1, Math.floor(nextXp / 500) + 1),
      badges: existing?.badges || [],
      streak: existing?.streak || 0,
      rank: computeRank(nextXp),
      favoriteMood: body.favoriteMood || existing?.favoriteMood || "Chill",
      stats: {
        watchHours: Number(body.hoursWatched || existing?.stats?.watchHours || 0),
        playHours: Number(body.hoursPlayed || existing?.stats?.playHours || 0),
        roomSessions: Number(body.roomSessions || existing?.stats?.roomSessions || 0),
      },
    };

    const saved = await UserProgress.findOneAndUpdate(
      { userId },
      { $set: nextDoc },
      { upsert: true, new: true }
    );

    await LeaderboardEntry.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          name: nextDoc.displayName,
          badge: nextDoc.favoriteMood ? `${nextDoc.favoriteMood} Curator` : "Rising Star",
          city: body.city || "Global",
          xp: nextXp,
          tier: computeTier(nextXp),
          weekXp: Math.round(nextXp * 0.16),
          monthXp: Math.round(nextXp * 0.48),
          allTimeXp: nextXp,
          wins: Math.max(0, Math.round(nextXp / 480)),
          badges: nextDoc.badges || [],
        },
      },
      { upsert: true, new: true }
    );

    await invalidateCache("leaderboard:weekly").catch(() => {});
    await invalidateCache("leaderboard:monthly").catch(() => {});
    await invalidateCache("leaderboard:all-time").catch(() => {});

    return NextResponse.json(normalizeDoc(saved, userId));
  } catch (error) {
    return NextResponse.json({ error: "Unable to persist dashboard data" }, { status: 500 });
  }
}
