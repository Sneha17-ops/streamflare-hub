"use client";

import React from "react";
import Link from "next/link";
import { Film, Music, Gamepad2, Info } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-900 bg-slate-950/60 backdrop-blur-md py-12 px-6 md:px-12 mt-20 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center">
              <span className="font-black text-white text-xs font-mono">SF</span>
            </div>
            <span className="text-md font-black tracking-tight text-white font-mono">
              STREAM<span className="text-cyan-400">FLARE</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
            Experience spatial entertainment with ultra-premium cinema streaming, lossless audio, and instant retro arcade gaming.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono mb-4">Categories</h4>
          <ul className="space-y-2.5">
            <li>
              <Link href="/movies" className="flex items-center space-x-2 text-xs text-slate-500 hover:text-cyan-400 smooth-transition">
                <Film className="w-3.5 h-3.5" />
                <span>Movies</span>
              </Link>
            </li>
            <li>
              <Link href="/music" className="flex items-center space-x-2 text-xs text-slate-500 hover:text-cyan-400 smooth-transition">
                <Music className="w-3.5 h-3.5" />
                <span>Music</span>
              </Link>
            </li>
            <li>
              <Link href="/games" className="flex items-center space-x-2 text-xs text-slate-500 hover:text-cyan-400 smooth-transition">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Gaming Arcade</span>
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono mb-4">Legal & Info</h4>
          <ul className="space-y-2.5">
            <li>
              <Link href="#" className="flex items-center space-x-2 text-xs text-slate-500 hover:text-purple-400 smooth-transition">
                <Info className="w-3.5 h-3.5" />
                <span>System Health</span>
              </Link>
            </li>
            <li>
              <Link href="#" className="text-xs text-slate-500 hover:text-purple-400 smooth-transition">Terms of Service</Link>
            </li>
            <li>
              <Link href="#" className="text-xs text-slate-500 hover:text-purple-400 smooth-transition">Privacy Policies</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono mb-4">Platform Stack</h4>
          <div className="flex flex-wrap gap-2">
            {['Next.js 15', 'Tailwind CSS', 'Zustand', 'Redis', 'Three.js', 'Socket.io'].map((tech) => (
              <span key={tech} className="text-[9px] font-bold font-mono tracking-wide text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded">{tech}</span>
            ))}
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-600 font-mono">
        <p>&copy; {currentYear} StreamFlare Inc. All Rights Reserved.</p>
        <p className="mt-2 sm:mt-0 flex items-center space-x-1.5">
          <span>Engineered by Antigravity</span>
          <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
        </p>
      </div>
    </footer>
  );
}
