"use client";
export const dynamic = 'force-dynamic';

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Compass } from "lucide-react";
import { GlassPanel } from "@/components/ImmersiveKit";

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <GlassPanel className="p-8 border border-white/10 relative overflow-hidden">
          {/* Neon accent orb background */}
          <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-pink-500/20 blur-3xl" />

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-400">
            <Compass className="h-8 w-8 animate-spin-slow" />
          </div>

          <h1 className="text-6xl font-black tracking-tight text-white mb-2 font-mono">404</h1>
          <h2 className="text-xl font-bold text-white mb-4">Cosmic Coordinates Lost</h2>
          
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            The page you are looking for has drifted into deep space. Let us guide you back to safety.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition"
            >
              <Sparkles className="h-4 w-4" />
              Return to Control Center
            </Link>
            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              Go to Landing Page
            </Link>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
