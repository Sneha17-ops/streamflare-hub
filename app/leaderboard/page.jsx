"use client";
export const dynamic = 'force-dynamic';


import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, BadgeCheck, TrendingUp, Users } from "lucide-react";
import { LeaderboardCard, SectionHeader, GlassPanel, StatTile } from "@/components/ImmersiveKit";
import AuthGate from "@/components/AuthGate";

const PERIODS = ["weekly", "monthly", "all-time", "friends"];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("all-time");
  const [entries, setEntries] = useState([]);
  const [me, setMe] = useState(null);

  useEffect(() => {
    let alive = true;
    async function loadLeaderboard() {
      const [leaderboardResponse, meResponse] = await Promise.all([
        fetch(`/api/leaderboard?period=${period}`, { cache: "no-store" }),
        fetch("/api/dashboard/me", { cache: "no-store" }),
      ]);

      const data = await leaderboardResponse.json();
      const meData = meResponse.ok ? await meResponse.json() : null;
      if (!alive) return;
      setEntries(data);
      setMe(meData);
    }
    loadLeaderboard();
    return () => {
      alive = false;
    };
  }, [period]);

  return (
    <AuthGate>
      <div className="space-y-8 pb-12">
      <SectionHeader
        kicker="Global XP"
        title="The leaderboard makes the ecosystem competitive, social, and sticky."
        subtitle="Track weekly, monthly, all-time, and friends rankings across entertainment sessions, room activity, and achievements."
        actionHref="/profile"
        actionLabel="Open profile"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatTile label="Ranked users" value={entries.length || 5} icon={Users} tone="cyan" />
        <StatTile label="Top XP" value={entries[0]?.xp || 9820} icon={Crown} tone="amber" />
        <StatTile label="Badges unlocked" value="128" icon={BadgeCheck} tone="emerald" />
        <StatTile label="Win streaks" value="24" icon={TrendingUp} tone="rose" />
      </div>

      {me ? (
        <GlassPanel className="border-cyan-400/20 bg-cyan-400/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300">Your live rank</p>
              <h2 className="mt-2 text-2xl font-black text-white">{me.displayName || "StreamFlare User"}</h2>
              <p className="mt-2 text-sm text-slate-400">{me.level ? `Level ${me.level}` : "Level 1"} · {me.badges?.length || 0} badges · {me.favoriteMood || "Chill"} mode</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-white">{me.xp || 0}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">XP</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-white">{me.rank || "Bronze"}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Tier</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-white">{me.streak || 0}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Streak</p>
              </div>
            </div>
          </div>
        </GlassPanel>
      ) : null}

      <GlassPanel className="p-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          {PERIODS.map((value) => (
            <button key={value} onClick={() => setPeriod(value)} className={`rounded-2xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] transition ${period === value ? "border-cyan-400/40 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-slate-400"}`}>
              {value}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {entries.map((entry, index) => (
            <LeaderboardCard key={entry.userId || entry.name} entry={entry} rank={index + 1} />
          ))}
        </div>
      </GlassPanel>
      </div>
    </AuthGate>
  );
}
