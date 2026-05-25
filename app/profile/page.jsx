"use client";
export const dynamic = 'force-dynamic';


import React from "react";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Activity, BadgeCheck, Crown, Heart, Music, Gamepad2, Film, Sparkles, LogOut, ArrowUpRight } from "lucide-react";
import { useUserStore } from "@/store";
import { GlassPanel, StatTile } from "@/components/ImmersiveKit";

export default function ProfilePage() {
  const { user } = useUser();
  const { favorites, watchlist, recentlyPlayed, hoursWatched, hoursPlayed } = useUserStore();
  const displayName = user?.fullName || user?.firstName || "StreamFlare User";

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">
            <Sparkles className="h-3 w-3 text-cyan-300 animate-pulse" />
            User Progress
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
            Welcome back, {displayName}
          </h1>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Track progression, favorite content, and the engagement loop that powers badges, XP, and social ranking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard" className="group inline-flex items-center gap-2 self-start rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white">
            Open dashboard
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <SignOutButton redirectUrl="/">
            <button className="group inline-flex items-center gap-2 self-start rounded-2xl border border-rose-800/40 bg-rose-950/20 px-4 py-3 text-xs font-bold uppercase tracking-[0.25em] text-rose-300 hover:text-white transition hover:border-rose-500 hover:bg-rose-950/60">
              Log Out
              <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </SignOutButton>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatTile label="Hours watched" value={hoursWatched.toFixed?.(1) || hoursWatched} icon={Film} tone="cyan" />
        <StatTile label="Hours played" value={hoursPlayed.toFixed?.(1) || hoursPlayed} icon={Gamepad2} tone="emerald" />
        <StatTile label="Favorites" value={favorites.length} icon={Heart} tone="rose" />
        <StatTile label="Watchlist" value={watchlist.length} icon={Crown} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <GlassPanel className="p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-black text-white">Recent activity</h2>
            <Activity className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="space-y-3">
            {recentlyPlayed.map((item) => (
              <motion.div key={item.id} whileHover={{ y: -2 }} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-slate-300">
                  {item.type === "song" ? <Music className="h-4 w-4" /> : <Film className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.type} · {new Date(item.playedAt).toLocaleString()}</p>
                </div>
                <Sparkles className="h-4 w-4 text-amber-300" />
              </motion.div>
            ))}
            {recentlyPlayed.length === 0 ? <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">No recent activity yet.</div> : null}
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-black text-white">Progression</h2>
            <BadgeCheck className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="space-y-4 text-sm text-slate-400">
            <p>Level-based progression, global XP, achievements, and badges are wired into the MongoDB schema and leaderboard surface.</p>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Status</p>
              <p className="mt-2 text-lg font-black text-white">Premium explorer</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Focus</p>
              <p className="mt-2 text-lg font-black text-white">AI mood, social rooms, arcade wins</p>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
