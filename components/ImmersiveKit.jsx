"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Bot, ChevronRight, Crown, Ghost, MessageSquareMore, Radio, Sparkles, Star, Trophy, Zap } from "lucide-react";

export function SectionHeader({ kicker, title, subtitle, actionHref, actionLabel }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-2">
        {kicker ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">
            <Sparkles className="h-3 w-3 text-cyan-300" />
            {kicker}
          </div>
        ) : null}
        <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">{title}</h1>
        {subtitle ? <p className="max-w-xl text-sm leading-6 text-slate-400">{subtitle}</p> : null}
      </div>
      {actionHref ? (
        <Link href={actionHref} className="group inline-flex items-center gap-2 self-start rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white">
          {actionLabel}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function GlowButton({ children, className = "", onClick, href, variant = "primary", type = "button", disabled = false, ...rest }) {
  const base = "group inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-transform duration-300 hover:-translate-y-0.5";
  const styles =
    variant === "secondary"
      ? "border border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10"
      : "bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.25)]";
  if (href) {
    return (
      <Link href={href} className={`${base} ${styles} ${className}`}>
        {children}
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles} ${disabled ? "cursor-not-allowed opacity-60 hover:translate-y-0" : ""} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function FloatingOrb({ className = "", style }) {
  return <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} style={style} />;
}

export function GlassPanel({ children, className = "" }) {
  return <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl ${className}`}>{children}</div>;
}

export function MoodCard({ mood, active, onClick, score }) {
  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition ${
        active ? "border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_35px_rgba(34,211,238,0.2)]" : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${mood.colors} opacity-0 transition-opacity duration-500 group-hover:opacity-15`} />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-2xl backdrop-blur">
            {mood.emoji}
          </div>
          <h3 className="text-lg font-black text-white">{mood.label}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">{mood.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-200">AI</span>
          <span className="text-xs text-slate-400">{score ? `${score} signal` : "Dynamic"}</span>
        </div>
      </div>
    </motion.button>
  );
}

export function RecommendationCarousel({ title, subtitle, items, accent = "cyan", onPick }) {
  const accentStyles = {
    cyan: "from-cyan-400/20 via-transparent to-cyan-400/5 text-cyan-300",
    rose: "from-rose-400/20 via-transparent to-rose-400/5 text-rose-300",
    amber: "from-amber-400/20 via-transparent to-amber-400/5 text-amber-300",
    emerald: "from-emerald-400/20 via-transparent to-emerald-400/5 text-emerald-300",
  };

  return (
    <GlassPanel className="p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
        </div>
        <div className={`rounded-full border border-white/10 bg-gradient-to-r px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] ${accentStyles[accent] || accentStyles.cyan}`}>
          Curated
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ y: -4 }}
            onClick={() => onPick?.(item)}
            className="group rounded-3xl border border-white/10 bg-slate-950/40 p-4 text-left transition hover:border-white/20 hover:bg-slate-900/70"
          >
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                {item.poster_path || item.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.poster_path || item.cover} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-500"><Star className="h-5 w-5" /></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate text-sm font-bold text-white">{item.title}</h3>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">{item.score ?? item.vote_average ?? item.rating ?? "AI"}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.description || item.genre || item.category}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                  <Sparkles className="h-3 w-3 text-cyan-300" />
                  Smart match
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </GlassPanel>
  );
}

export function VoiceOrb({ active, text, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        animate={active ? { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.85] } : { scale: 1, opacity: 0.85 }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        className="absolute h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/30 via-fuchsia-500/20 to-amber-400/20 blur-2xl"
      />
      <motion.div
        animate={active ? { scale: [0.96, 1.04, 0.98] } : { scale: 1 }}
        transition={{ repeat: Infinity, duration: 1.2 }}
        className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-slate-950/70 shadow-[0_0_40px_rgba(56,189,248,0.15)] backdrop-blur"
      >
        <Bot className={`h-10 w-10 ${active ? "text-cyan-300" : "text-slate-300"}`} />
      </motion.div>
      <div className="absolute -bottom-14 w-72 max-w-[80vw] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-center text-xs leading-5 text-slate-300 backdrop-blur-xl">
        {text || "Say what you want. I’ll queue it."}
      </div>
    </div>
  );
}

export function EqualizerBars({ active = true, className = "" }) {
  const bars = [18, 30, 22, 34, 26, 28, 20];
  return (
    <div className={`flex items-end gap-1 ${className}`}> 
      {bars.map((height, index) => (
        <motion.span
          key={index}
          animate={active ? { height: [height, height + 10, height + 4, height] } : { height }}
          transition={{ repeat: Infinity, duration: 0.85 + index * 0.08, ease: "easeInOut" }}
          className="w-1.5 rounded-full bg-gradient-to-t from-cyan-400 via-fuchsia-500 to-amber-400"
          style={{ height }}
        />
      ))}
    </div>
  );
}

export function LeaderboardCard({ entry, rank }) {
  const medal = rank === 1 ? Crown : rank === 2 ? Trophy : rank === 3 ? Ghost : Star;
  const MedalIcon = medal;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 text-white">
        <MedalIcon className="h-5 w-5 text-amber-300" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate text-sm font-bold text-white">{entry.name}</h3>
          <span className="text-xs font-black text-cyan-300">{entry.xp} XP</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">{entry.badge} · {entry.city || "Global"}</p>
      </div>
      <div className="text-right text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
        #{rank}
      </div>
    </motion.div>
  );
}

export function StatTile({ label, value, icon: Icon, tone = "cyan" }) {
  const toneStyles = {
    cyan: "text-cyan-300",
    rose: "text-rose-300",
    amber: "text-amber-300",
    emerald: "text-emerald-300",
  };
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-2">
          <Icon className={`h-4 w-4 ${toneStyles[tone] || toneStyles.cyan}`} />
        </div>
        <Radio className="h-4 w-4 text-slate-700" />
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">{label}</p>
    </div>
  );
}
