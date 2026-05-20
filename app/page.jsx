"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Film, Music, Gamepad2, Sparkles, ChevronRight, Star, Zap, Shield, Globe } from "lucide-react";

// ── Animated floating orb ────────────────────────────────────────────────────
function Orb({ style }) {
  return <div className="absolute rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={style} />;
}

// ── Feature pill ─────────────────────────────────────────────────────────────
function FeaturePill({ icon: Icon, label, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border backdrop-blur-sm cursor-default ${color}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs font-bold uppercase tracking-widest font-mono">{label}</span>
    </motion.div>
  );
}

// ── Platform card ─────────────────────────────────────────────────────────────
function PlatformCard({ icon: Icon, title, desc, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative group rounded-3xl p-7 border border-slate-800 bg-slate-950/60 backdrop-blur-xl overflow-hidden"
    >
      {/* Gradient glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${gradient} border border-white/10`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2 font-mono">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ value, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="text-center"
    >
      <p className="text-4xl md:text-5xl font-black text-white font-mono">{value}</p>
      <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-mono">{label}</p>
    </motion.div>
  );
}

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(words, speed = 80, pause = 2000) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !deleting) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }
    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }
    const t = setTimeout(() => {
      setText(words[index].substring(0, subIndex));
      setSubIndex((s) => s + (deleting ? -1 : 1));
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [subIndex, deleting, index]);

  return text;
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const words = ["Movies & Series", "Music & Playlists", "Retro Arcade Games", "Premium Content"];
  const typed = useTypewriter(words);

  const cards = [
    {
      icon: Film,
      title: "Cinematic Streaming",
      desc: "Stream blockbuster movies and series with immersive cinematics, trailer previews on hover, watchlists and rating systems.",
      gradient: "from-purple-600/20 to-pink-600/10",
      delay: 0,
    },
    {
      icon: Music,
      title: "Audio Deck",
      desc: "A full music player with playlists, shared listening rooms, equalizer controls and multi-language track discovery.",
      gradient: "from-cyan-600/20 to-emerald-600/10",
      delay: 0.1,
    },
    {
      icon: Gamepad2,
      title: "Arcade Console",
      desc: "Play retro and AAA canvas games directly in the browser. Memory Match, Space Shooter, Adventure Island and more.",
      gradient: "from-pink-600/20 to-orange-600/10",
      delay: 0.2,
    },
    {
      icon: Sparkles,
      title: "Personal Dashboard",
      desc: "Your own hub — recently played, favorites, watchlist, activity charts and personalized recommendations.",
      gradient: "from-amber-600/20 to-yellow-600/10",
      delay: 0.3,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden">

      {/* ── BACKGROUND ORBS ───────────────────────────────────────────────── */}
      <Orb style={{ width: 600, height: 600, top: "-10%", left: "-10%", background: "rgba(139,92,246,0.12)" }} />
      <Orb style={{ width: 500, height: 500, top: "30%", right: "-15%", background: "rgba(6,182,212,0.08)" }} />
      <Orb style={{ width: 400, height: 400, bottom: "10%", left: "20%", background: "rgba(236,72,153,0.07)" }} />

      {/* ── GRID OVERLAY ──────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-32">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-950/30 backdrop-blur-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span className="text-xs font-mono text-purple-300 uppercase tracking-widest">Now Live — Premium Entertainment Hub</span>
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-4"
        >
          <h1 className="text-[clamp(3rem,10vw,8rem)] font-black leading-none tracking-tighter text-white font-mono">
            STREAM
            <span
              className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent"
              style={{ WebkitTextStroke: "0px" }}
            >
              FLARE
            </span>
          </h1>
        </motion.div>

        {/* Typewriter subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="h-8 flex items-center justify-center mb-8"
        >
          <span className="text-lg md:text-xl text-slate-300 font-mono">
            Discover{" "}
            <span className="text-white font-bold border-b-2 border-cyan-400">
              {typed}
              <span className="animate-pulse">|</span>
            </span>
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl text-base text-slate-400 leading-relaxed mb-10"
        >
          The ultimate entertainment hub — cinematic movie streaming, shared music rooms,
          retro arcade gaming, all wrapped in a stunning glassmorphic dashboard.
          Sign in to unlock everything.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-14"
        >
          <Link
            href="/sign-in"
            className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-white overflow-hidden"
            style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)" }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Get Started Free
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            href="/sign-in"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-slate-700 text-slate-300 font-semibold text-sm hover:border-slate-500 hover:text-white hover:bg-slate-900/50 transition-all duration-300"
          >
            <Play className="w-4 h-4" />
            See a Preview
          </Link>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <FeaturePill icon={Film} label="Movies" color="border-purple-500/30 bg-purple-950/20 text-purple-300" />
          <FeaturePill icon={Music} label="Music" color="border-cyan-500/30 bg-cyan-950/20 text-cyan-300" />
          <FeaturePill icon={Gamepad2} label="Games" color="border-pink-500/30 bg-pink-950/20 text-pink-300" />
          <FeaturePill icon={Star} label="Watchlist" color="border-amber-500/30 bg-amber-950/20 text-amber-300" />
          <FeaturePill icon={Zap} label="Real-Time" color="border-emerald-500/30 bg-emerald-950/20 text-emerald-300" />
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-10 bg-gradient-to-b from-slate-600 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
      <section className="relative py-16 border-y border-slate-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/10 via-transparent to-cyan-950/10" />
        <div className="relative max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value="15+" label="Movies" delay={0} />
          <StatCard value="25+" label="Music Tracks" delay={0.1} />
          <StatCard value="4+" label="Arcade Games" delay={0.2} />
          <StatCard value="10+" label="Languages" delay={0.3} />
        </div>
      </section>

      {/* ── PLATFORM CARDS ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-3"
          >
            ✦ Platform Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight"
          >
            Everything. In one place.
          </motion.h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c) => (
            <PlatformCard key={c.title} {...c} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-black text-white"
          >
            3 steps. Zero friction.
          </motion.h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Create your account", desc: "Sign up free in seconds. No credit card needed.", icon: Shield },
            { step: "02", title: "Explore the hub", desc: "Movies, music, and games all unlock instantly after login.", icon: Globe },
            { step: "03", title: "Enjoy everything", desc: "Stream, play, listen — and curate your personal collections.", icon: Sparkles },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-slate-800 bg-slate-900 mb-4 group-hover:border-purple-500/50 transition-colors duration-300">
                <item.icon className="w-6 h-6 text-slate-400 group-hover:text-purple-400 transition-colors duration-300" />
              </div>
              <div className="text-[10px] font-mono text-slate-700 mb-1 tracking-widest">{item.step}</div>
              <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-3xl mx-auto rounded-3xl overflow-hidden border border-slate-800 p-14"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-slate-950 to-cyan-950/30" />
          <div className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 30% 50%, rgba(139,92,246,0.1) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(6,182,212,0.08) 0%, transparent 60%)"
            }}
          />
          {/* Top border glow */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Your hub awaits.
            </h2>
            <p className="text-slate-400 text-base mb-10 max-w-md mx-auto leading-relaxed">
              Join StreamFlare and unlock the full cinematic entertainment experience.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-base text-white"
              style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)" }}
            >
              <Sparkles className="w-5 h-5" />
              Sign In to StreamFlare
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
