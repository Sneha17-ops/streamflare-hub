"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useUserStore } from "@/store";

export default function UserProgressSync() {
  const { user, isSignedIn } = useUser();
  const syncUserData = useUserStore((state) => state.syncUserData);
  const favorites = useUserStore((state) => state.favorites);
  const watchlist = useUserStore((state) => state.watchlist);
  const recentlyPlayed = useUserStore((state) => state.recentlyPlayed);
  const hoursWatched = useUserStore((state) => state.hoursWatched);
  const hoursPlayed = useUserStore((state) => state.hoursPlayed);
  const hydratedRef = React.useRef(false);
  const saveTimerRef = React.useRef(null);

  React.useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    let alive = true;
    async function loadProgress() {
      try {
        const response = await fetch("/api/dashboard/me", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (!alive || !data) return;
        syncUserData({
          favorites: data.favorites || [],
          watchlist: data.watchlist || [],
          recentlyPlayed: data.recentlyPlayed || [],
          hoursWatched: data.hoursWatched ?? hoursWatched,
          hoursPlayed: data.hoursPlayed ?? hoursPlayed,
          displayName: data.displayName || user.fullName || data.displayName,
        });
        hydratedRef.current = true;
      } catch (error) {
        // Best-effort hydration.
      }
    }

    loadProgress();
    return () => {
      alive = false;
    };
    // Intentionally run once per signed-in session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user?.id]);

  React.useEffect(() => {
    if (!isSignedIn || !hydratedRef.current) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        await fetch("/api/dashboard/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            favorites,
            watchlist,
            recentlyPlayed,
            hoursWatched,
            hoursPlayed,
            displayName: user?.fullName || user?.firstName || user?.username || "StreamFlare User",
            favoriteMood: data?.favoriteMood,
          }),
        });
      } catch (error) {
        // Best-effort sync.
      }
    }, 400);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [isSignedIn, favorites, watchlist, recentlyPlayed, hoursWatched, hoursPlayed]);

  return null;
}
