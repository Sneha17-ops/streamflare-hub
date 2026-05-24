"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Check, Heart } from "lucide-react";
import { useUserStore } from "../store";
import BlurImage from "./BlurImage";

export default function MovieCard({ movie }) {
  const { watchlist, favorites, addToWatchlist, removeFromWatchlist, addFavorite, removeFavorite } = useUserStore();
  const [shouldPlay, setShouldPlay] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const videoRef = useRef(null);
  const dragRef = useRef(null);

  const inWatchlist = watchlist.some((w) => w.id === movie.id);
  const inFavorites = favorites.some((f) => f.id === movie.id);

  // Dynamic AI Match Rating based on title hashes
  const matchRating = useMemo(() => {
    const base = movie.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (base % 12) + 88; // Deterministic score between 88% and 99%
  }, [movie.title]);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShouldPlay(true);
    }, 550);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    // Limit rotation angle to max 12 degrees
    const rotateX = -((y - yc) / yc) * 12;
    const rotateY = ((x - xc) / xc) * 12;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setShouldPlay(false);
    setTilt({ x: 0, y: 0 });
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  // Luxury-level sound fade-in for trailers
  useEffect(() => {
    if (shouldPlay && videoRef.current) {
      const video = videoRef.current;
      video.muted = true; // start muted to satisfy browser autoplay security
      video.volume = 0;
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Unmute and start fade-in
            video.muted = false;
            let vol = 0;
            const interval = setInterval(() => {
              vol = Math.min(vol + 0.05, 0.5);
              video.volume = vol;
              if (vol >= 0.5) clearInterval(interval);
            }, 80);
            video._fadeInterval = interval;
          })
          .catch(() => {
            // Fallback if browser forces muted playback
            video.muted = true;
          });
      }
    }

    return () => {
      if (videoRef.current && videoRef.current._fadeInterval) {
        clearInterval(videoRef.current._fadeInterval);
      }
    };
  }, [shouldPlay]);

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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-glass cursor-pointer select-none group transition-all duration-300 ease-out hover:border-pink-500/50"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.03, 1.03, 1.03)`,
        boxShadow: shouldPlay 
          ? "0 20px 40px rgba(236, 72, 153, 0.35), 0 0 20px rgba(168, 85, 247, 0.2)"
          : "0 4px 20px rgba(0,0,0,0.5)",
        transition: dragRef.current ? "none" : "transform 0.15s ease-out, box-shadow 0.3s ease",
      }}
    >
      <BlurImage
        src={movie.poster_path}
        alt={movie.title}
        fill
        className="object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
      />

      {/* AI Smart Match Badge */}
      <div className="absolute left-3 top-3 z-20 rounded-full border border-pink-500/30 bg-black/50 px-2.5 py-1 text-[9px] font-black tracking-widest text-pink-400 backdrop-blur-md uppercase">
        ⚡ {matchRating}% Match
      </div>

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
              ref={videoRef}
              src={movie.videoUrl}
              loop
              playsInline
              className="w-full h-full object-cover scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute left-4 right-4 top-12 rounded-2xl border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-400">Cinematic Trailer</p>
              <p className="mt-0.5 text-xs font-bold text-white truncate">{movie.title}</p>
              <p className="text-[9px] text-slate-400 truncate">{movie.genre} · {movie.runtime}</p>
            </div>
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
