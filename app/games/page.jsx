"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Search, SlidersHorizontal } from "lucide-react";
import { fetchTrendingGames } from "@/lib/api";
import GameCard from "@/components/GameCard";
import ArcadeModal from "@/components/ArcadeModal";

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [activeArcadeGame, setActiveArcadeGame] = useState(null);

  const categories = ["All", "AAA Console", "Legacy Retro"];

  useEffect(() => {
    async function loadGames() {
      const data = await fetchTrendingGames();
      setGames(data);
      setFilteredGames(data);
    }
    loadGames();
  }, []);

  useEffect(() => {
    let result = games;

    if (selectedCategory === "AAA Console") {
      result = result.filter((g) => !g.isLegacy);
    } else if (selectedCategory === "Legacy Retro") {
      result = result.filter((g) => g.isLegacy);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
      );
    }

    setFilteredGames(result);
  }, [searchQuery, selectedCategory, games]);

  const handleGameLaunch = (game) => {
    if (game.isLegacy) {
      setActiveArcadeGame({ url: game.gameUrl, title: game.title });
    } else {
      window.open(game.gameUrl, "_blank");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-900 pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white font-mono uppercase flex items-center space-x-3">
            <Gamepad2 className="w-8 h-8 text-pink-500" />
            <span>Gaming Arcade</span>
          </h1>
          <p className="text-xs text-slate-400">Play responsive retro canvas arcades or browse modern AAA console titles.</p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search console..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-pink-500 outline-none transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide select-none">
        <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-400">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border smooth-transition whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-pink-600 border-pink-500 text-white shadow-neon-accent"
                : "bg-slate-900/30 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredGames.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredGames.map((game) => (
            <motion.div key={game.id} variants={itemVariants}>
              <GameCard game={game} onPlay={handleGameLaunch} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-500">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wide">No Console Matches</h3>
          <p className="text-xs text-slate-500 max-w-xs">Try adjusting your search filters to find available gaming programs.</p>
        </div>
      )}

      {activeArcadeGame && (
        <ArcadeModal isOpen={true} onClose={() => setActiveArcadeGame(null)} gameUrl={activeArcadeGame.url} gameTitle={activeArcadeGame.title} />
      )}
    </div>
  );
}
