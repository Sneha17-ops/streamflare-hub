"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Check, Heart } from "lucide-react";
import { useUserStore } from "../store";
import BlurImage from "./BlurImage";

export default function MovieCard({ movie }) {
  const { watchlist, favorites, addToWatchlist, removeFromWatchlist, addFavorite, removeFavorite } = useUserStore();
  const [isHovered, setIsHovered] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const inWatchlist = watchlist.some((w) => w.id === movie.id);
  const inFavorites = favorites.some((f) => f.id === movie.id);

  const handleMouseEnter = () => {
    setIsHovered(true);
    hoverTimeoutRef.current = setTimeout(() => {
      setShouldPlay(true);
    }, 600);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShouldPlay(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleWatchlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist({ id: movie.id, title: movie.title, cover: movie.poster_path });
    }
  };

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inFavorites) {
      removeFavorite(movie.id);
    } else {
      addFavorite({ id: movie.id, type: "movie", title: movie.title, cover: movie.poster_path });
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-glass cursor-pointer select-none group smooth-transition hover:shadow-neon-purple"
    >
      <BlurImage
        src={movie.poster_path}
        alt={movie.title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      <AnimatePresence>
        {shouldPlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-10 w-full h-full bg-black"
          >
            <video
              src={movie.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 smooth-transition">
        
        <h4 className="text-sm font-bold text-white uppercase tracking-wide font-mono truncate">
          {movie.title}
        </h4>
        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{movie.genre}</p>
        
        <div className="flex items-center justify-between mt-3.5">
          <div className="flex items-center space-x-2 font-mono text-[9px]">
            <span className="text-cyan-400 font-bold bg-cyan-950/50 border border-cyan-900/30 px-1.5 py-0.5 rounded">
              ★ {movie.vote_average.toFixed(1)}
            </span>
            <span className="text-slate-500">{movie.runtime}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleFavoriteToggle}
              className={`p-2 rounded-full border smooth-transition ${
                inFavorites 
                  ? "bg-rose-950/50 border-rose-500 text-rose-400 shadow-neon-accent" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${inFavorites ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
            <button
              onClick={handleWatchlistToggle}
              className={`p-2 rounded-full border smooth-transition ${
                inWatchlist 
                  ? "bg-emerald-950/50 border-emerald-500 text-emerald-400" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
            <Link
              href={`/movies/${movie.id}`}
              className="p-2 rounded-full bg-cyan-400 text-slate-950 hover:shadow-neon-cyan smooth-transition"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
