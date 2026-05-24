"use client";
export const dynamic = 'force-dynamic';


import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gamepad2, ArrowLeft, Play, Sparkles, Trophy, Zap, ExternalLink } from "lucide-react";
import { fetchTrendingGames } from "@/lib/api";
import BlurImage from "@/components/BlurImage";
import ArcadeModal from "@/components/ArcadeModal";
import { GlassPanel, GlowButton, SectionHeader } from "@/components/ImmersiveKit";
import AuthGate from "@/components/AuthGate";

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [game, setGame] = useState(null);
  const [launchOpen, setLaunchOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    async function loadGame() {
      const data = await fetchTrendingGames();
      if (!alive) return;
      const found = data.find((item) => item.id === params?.id);
      setGame(found || data[0] || null);
    }
    loadGame();
    return () => {
      alive = false;
    };
  }, [params?.id]);

  if (!game) {
    return <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">Loading game...</div>;
  }

  const launchGame = () => {
    if (game.isLegacy) {
      setLaunchOpen(true);
    } else {
      window.open(game.gameUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <AuthGate>
      <div className="space-y-8 pb-12">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <SectionHeader
        kicker="Game Detail"
        title={game.title}
        subtitle={game.description}
        actionHref="/arcade"
        actionLabel="Back to arcade"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <GlassPanel className="overflow-hidden p-0">
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10">
            <BlurImage src={game.cover} alt={game.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
            <div className="absolute left-6 bottom-6 right-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-200 backdrop-blur">
                  {game.isLegacy ? "Legacy Retro" : "AAA Console"}
                </div>
                <h2 className="mt-3 text-3xl font-black text-white">{game.category}</h2>
              </div>
              <GlowButton onClick={launchGame}>
                <Play className="h-4 w-4" />
                Launch game
              </GlowButton>
            </div>
          </div>
        </GlassPanel>

        <div className="space-y-6">
          <GlassPanel className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Game signal</h3>
              <Sparkles className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat label="Rating" value={game.rating.toFixed(1)} tone="cyan" />
              <MiniStat label="Mode" value={game.isLegacy ? "In-app" : "External"} tone="rose" />
              <MiniStat label="Trend" value="Hot" tone="amber" />
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Launch options</h3>
              <ExternalLink className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="space-y-3 text-sm text-slate-400">
              <p>This page gives non-legacy titles a real destination and keeps legacy games inside the app shell.</p>
              <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">{game.gameUrl}</p>
              <GlowButton variant="secondary" onClick={launchGame} className="w-full justify-center">
                {game.isLegacy ? "Open retro modal" : "Open live external page"}
              </GlowButton>
            </div>
          </GlassPanel>

          <div className="grid gap-4 md:grid-cols-2">
            <GlassPanel className="p-4 text-center">
              <Trophy className="mx-auto h-5 w-5 text-amber-300" />
              <p className="mt-2 text-xl font-black text-white">Leaderboard ready</p>
              <p className="mt-1 text-xs text-slate-500">Track wins and XP</p>
            </GlassPanel>
            <GlassPanel className="p-4 text-center">
              <Zap className="mx-auto h-5 w-5 text-cyan-300" />
              <p className="mt-2 text-xl font-black text-white">Cloud arcade</p>
              <p className="mt-1 text-xs text-slate-500">Fast launch flow</p>
            </GlassPanel>
          </div>
        </div>
      </div>

      {launchOpen ? <ArcadeModal isOpen={true} onClose={() => setLaunchOpen(false)} gameUrl={game.gameUrl} gameTitle={game.title} /> : null}
      </div>
    </AuthGate>
  );
}

function MiniStat({ label, value, tone }) {
  const toneClasses = tone === "cyan" ? "text-cyan-300" : tone === "rose" ? "text-rose-300" : "text-amber-300";
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
      <p className={`text-2xl font-black ${toneClasses}`}>{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">{label}</p>
    </div>
  );
}
