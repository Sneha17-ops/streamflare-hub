"use client";
export const dynamic = 'force-dynamic';


import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Trophy, Sparkles, Zap, Target, Loader2 } from "lucide-react";
import { fetchTrendingGames } from "@/lib/api";
import GameCard from "@/components/GameCard";
import { SectionHeader, GlassPanel, StatTile } from "@/components/ImmersiveKit";
import ArcadeModal from "@/components/ArcadeModal";
import AuthGate from "@/components/AuthGate";

export default function ArcadePage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeGame, setActiveGame] = useState(null);

  useEffect(() => {
    let alive = true;
    async function loadGames() {
      const data = await fetchTrendingGames();
      if (!alive) return;
      setGames(data);
      setLoading(false);
    }
    loadGames();
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => ["All", "AAA Console", "Legacy Retro"], []);

  const filteredGames = useMemo(() => {
    if (selectedCategory === "AAA Console") return games.filter((game) => !game.isLegacy);
    if (selectedCategory === "Legacy Retro") return games.filter((game) => game.isLegacy);
    return games;
  }, [games, selectedCategory]);

  return (
    <AuthGate>
      <div className="space-y-8 pb-12">
      <SectionHeader
        kicker="Cloud Arcade"
        title="A premium gaming hub with motion-heavy cards, progression, and instant launch flows."
        subtitle="Retro canvas games, AAA discovery, achievements, and tournament-ready surfaces inside a futuristic console-grade layout."
        actionHref="/leaderboard"
        actionLabel="Open leaderboard"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatTile label="Games" value={games.length || 6} icon={Gamepad2} tone="cyan" />
        <StatTile label="Achievements" value="42" icon={Trophy} tone="amber" />
        <StatTile label="Weekly XP" value="1.8k" icon={Zap} tone="emerald" />
        <StatTile label="Tournaments" value="8" icon={Target} tone="rose" />
      </div>

      <GlassPanel className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {categories.map((category) => (
            <button key={category} onClick={() => setSelectedCategory(category)} className={`rounded-2xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] transition ${selectedCategory === category ? "border-pink-400/40 bg-pink-400/10 text-white" : "border-white/10 bg-white/5 text-slate-400"}`}>
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-300">
            <Loader2 className="mr-3 h-4 w-4 animate-spin text-cyan-300" /> Loading game horizon
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredGames.map((game) => (
              <motion.div key={game.id} whileHover={{ y: -4 }}>
                <GameCard game={game} onPlay={(item) => setActiveGame({ url: item.gameUrl, title: item.title })} showPreview />
              </motion.div>
            ))}
          </motion.div>
        )}
      </GlassPanel>

      <ArcadeModal isOpen={!!activeGame} onClose={() => setActiveGame(null)} gameUrl={activeGame?.url} gameTitle={activeGame?.title} />
      </div>
    </AuthGate>
  );
}
