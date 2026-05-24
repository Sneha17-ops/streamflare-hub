"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import BlurImage from "./BlurImage";

export default function GameCard({ game, onPlay, showPreview = true }) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const factorX = -(y / (rect.height / 2)) * 12;
    const factorY = (x / (rect.width / 2)) * 12;
    setRotateX(factorX);
    setRotateY(factorY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: isHovered ? "none" : "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
      className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-glass cursor-pointer select-none group smooth-transition hover:border-pink-500 hover:shadow-neon-accent"
    >
      <BlurImage
        src={game.cover}
        alt={game.title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      {showPreview && isHovered && (
        <div className="absolute inset-0 z-10 w-full h-full bg-black">
          <video
            src={game.videoPreview}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {game.isLegacy && (
        <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] opacity-25" />
      )}

      <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent">
        <div className="flex items-start justify-between">
          <span className={`text-[8px] font-bold uppercase tracking-widest font-mono border px-2 py-0.5 rounded-full ${
            game.isLegacy 
              ? "bg-purple-950/60 border-purple-500 text-purple-300 shadow-neon-purple animate-pulse" 
              : "bg-pink-950/60 border-pink-500 text-pink-300"
          }`}>
            {game.isLegacy ? "Legacy Retro" : "AAA Console"}
          </span>
          <div className="flex items-center space-x-1 text-[9px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded">
            ★ {game.rating.toFixed(1)}
          </div>
        </div>

        <h3 className="text-md font-bold text-white uppercase tracking-wide font-mono mt-2 truncate">{game.title}</h3>
        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{game.category}</p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3 opacity-0 group-hover:opacity-100 smooth-transition">
          <span className="text-[9px] font-mono text-slate-500">{game.isLegacy ? "Click to play in-app" : "Open game detail"}</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPlay(game);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-pink-500 text-white font-mono text-[10px] font-bold uppercase tracking-widest hover:scale-105 hover:shadow-neon-accent smooth-transition"
          >
            <Play className="w-3 h-3 fill-white text-white" />
            <span>Launch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
