"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Film, Music, Gamepad2, Play } from "lucide-react";
import { useSearchStore, useMusicStore, useUserStore } from "../store";
import { MOCK_MOVIES, MOCK_SONGS, MOCK_GAMES } from "../lib/api";
import BlurImage from "./BlurImage";
import ArcadeModal from "./ArcadeModal";

export default function GlobalSearch() {
  const { isOpen, setIsOpen, query, setQuery } = useSearchStore();
  const setCurrentTrack = useMusicStore((state) => state.setCurrentTrack);
  const addRecentlyPlayed = useUserStore((state) => state.addRecentlyPlayed);

  const [activeCategory, setActiveCategory] = useState("all");
  const [movieResults, setMovieResults] = useState(MOCK_MOVIES);
  const [songResults, setSongResults] = useState(MOCK_SONGS);
  const [gameResults, setGameResults] = useState(MOCK_GAMES);

  const [activeArcadeGame, setActiveArcadeGame] = useState(null);

  useEffect(() => {
    if (!query) {
      setMovieResults(MOCK_MOVIES);
      setSongResults(MOCK_SONGS);
      setGameResults(MOCK_GAMES);
      return;
    }

    const handler = setTimeout(() => {
      const q = query.toLowerCase();
      
      setMovieResults(
        MOCK_MOVIES.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.genre.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q)
        )
      );

      setSongResults(
        MOCK_SONGS.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.artist.toLowerCase().includes(q) ||
            s.album.toLowerCase().includes(q)
        )
      );

      setGameResults(
        MOCK_GAMES.filter(
          (g) =>
            g.title.toLowerCase().includes(q) ||
            g.category.toLowerCase().includes(q) ||
            g.description.toLowerCase().includes(q)
        )
      );
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  const handleMoviePlay = (movie) => {
    addRecentlyPlayed({
      id: movie.id,
      type: "movie",
      title: movie.title,
      cover: movie.poster_path
    });
    setIsOpen(false);
    window.location.href = `/movies/${movie.id}`;
  };

  const handleSongPlay = (song) => {
    setCurrentTrack(song);
    addRecentlyPlayed({
      id: song.id,
      type: "song",
      title: song.title,
      cover: song.cover
    });
    setIsOpen(false);
  };

  const handleGamePlay = (game) => {
    addRecentlyPlayed({
      id: game.id,
      type: "game",
      title: game.title,
      cover: game.cover
    });
    if (game.isLegacy) {
      setActiveArcadeGame({ url: game.gameUrl, title: game.title });
    } else {
      window.open(game.gameUrl, "_blank");
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#020617]/95 backdrop-blur-2xl px-6 py-8 md:px-24 md:py-16"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
              <div className="flex items-center space-x-3 text-cyan-400 font-mono tracking-widest text-xs uppercase">
                <Search className="w-4 h-4" />
                <span>Global Multi-Index Search</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-red-500 hover:text-red-400 smooth-transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mt-8 max-w-4xl mx-auto w-full">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, songs, AAA titles, retro games..."
                className="w-full pl-16 pr-6 py-5 text-xl font-medium bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:border-purple-500 focus:shadow-neon-purple outline-none transition-all duration-300"
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
            </div>

            <div className="flex items-center justify-center space-x-3 mt-6">
              {["all", "movies", "music", "games"].map((cat, idx) => (
                <button
                  key={cat ?? `cat-${idx}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase border smooth-transition ${
                    activeCategory === cat
                      ? "bg-purple-600 border-purple-500 text-white shadow-neon-purple"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto mt-10 pr-2">
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {(activeCategory === "all" || activeCategory === "movies") && (
                  <div className="space-y-4">
                    <h4 className="flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-purple-400 font-mono">
                      <Film className="w-4 h-4" />
                      <span>Cinema Matches ({movieResults.length})</span>
                    </h4>
                    <div className="space-y-3">
                      {movieResults.map((m, mi) => (
                        <div
                          key={m.id ?? `movie-${mi}`}
                          onClick={() => handleMoviePlay(m)}
                          className="flex items-center space-x-4 p-3 rounded-xl glass-panel hover:bg-white/5 cursor-pointer smooth-transition group"
                        >
                          <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0">
                            <BlurImage src={m.poster_path} alt={m.title} width={48} height={64} className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-white text-sm truncate group-hover:text-purple-400 transition-colors duration-300">
                              {m.title}
                            </h5>
                            <p className="text-xs text-slate-400 truncate">{m.genre}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded">
                                ★ {m.vote_average}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(activeCategory === "all" || activeCategory === "music") && (
                  <div className="space-y-4">
                    <h4 className="flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-cyan-400 font-mono">
                      <Music className="w-4 h-4" />
                      <span>Audio Tracks ({songResults.length})</span>
                    </h4>
                    <div className="space-y-3">
                      {songResults.map((s, si) => (
                        <div
                          key={s.id ?? `song-${si}`}
                          onClick={() => handleSongPlay(s)}
                          className="flex items-center space-x-4 p-3 rounded-xl glass-panel hover:bg-white/5 cursor-pointer smooth-transition group"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                            <BlurImage src={s.cover} alt={s.title} width={48} height={48} className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                              <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-white text-sm truncate group-hover:text-cyan-400 transition-colors duration-300">
                              {s.title}
                            </h5>
                            <p className="text-xs text-slate-400 truncate">{s.artist}</p>
                            <span className="text-[10px] font-mono text-slate-500">{s.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(activeCategory === "all" || activeCategory === "games") && (
                  <div className="space-y-4">
                    <h4 className="flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-pink-400 font-mono">
                      <Gamepad2 className="w-4 h-4" />
                      <span>Console Matches ({gameResults.length})</span>
                    </h4>
                    <div className="space-y-3">
                      {gameResults.map((g, gi) => (
                        <div
                          key={g.id ?? `game-${gi}`}
                          onClick={() => handleGamePlay(g)}
                          className="flex items-center space-x-4 p-3 rounded-xl glass-panel hover:bg-white/5 cursor-pointer smooth-transition group"
                        >
                          <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0">
                            <BlurImage src={g.cover} alt={g.title} width={64} height={48} className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-white text-sm truncate group-hover:text-pink-400 transition-colors duration-300">
                              {g.title}
                            </h5>
                            <p className="text-xs text-slate-400 truncate">{g.category}</p>
                            <span className="text-[10px] font-mono text-pink-400/80 bg-pink-950/40 px-1.5 py-0.5 rounded">
                              ★ {g.rating}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeArcadeGame && (
        <ArcadeModal
          isOpen={true}
          onClose={() => setActiveArcadeGame(null)}
          gameUrl={activeArcadeGame.url}
          gameTitle={activeArcadeGame.title}
        />
      )}
    </>
  );
}
