"use client";

export const dynamic = 'force-dynamic';

import React, { useMemo } from "react";
import nextDynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  User, Activity, Clock, Film, Music, Gamepad2,
  Heart, Trash2, Play, Star, TrendingUp, Eye,
  ListMusic, LayoutGrid, Sparkles, Shield, Trophy,
  ChevronRight, Radio, Zap
} from "lucide-react";
import { useUserStore, useMusicStore } from "@/store";
import BlurImage from "@/components/BlurImage";
import AuthGate from "@/components/AuthGate";

const ActivityChart = nextDynamic(() => import("@/components/ActivityChart"), { ssr: false });

/* ── animated counter ────────────────────────────────── */
function Counter({ value, suffix = "" }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    const target = Number(value) || 0;
    let start = 0;
    const step = Math.max(0.1, target / 60);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(id); }
      else { setDisplay(parseFloat(start.toFixed(1))); }
    }, 16);
    return () => clearInterval(id);
  }, [value]);
  return (
    <span className="text-3xl font-black font-mono text-white">
      {typeof display === "number" && display % 1 !== 0 ? display.toFixed(1) : display}
      {suffix && <span className="text-sm font-medium ml-1 text-slate-400">{suffix}</span>}
    </span>
  );
}

/* ── mini media card ─────────────────────────────────── */
function MediaCard({ item, onRemove, onPlay, type }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative flex items-center gap-3 p-3 rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70 cursor-pointer smooth-transition"
      onClick={() => onPlay && onPlay(item)}
    >
      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
        <BlurImage src={item.cover || item.poster_path || "/assets/movie1.webp"} alt={item.title} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{item.title}</p>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {item.language || item.genre || (type === "song" ? "Music" : "Movie")}
        </p>
      </div>
      {onPlay && type === "song" && (
        <button
          onClick={(e) => { e.stopPropagation(); onPlay(item); }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white smooth-transition"
        >
          <Play className="w-3 h-3 fill-white" />
        </button>
      )}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-rose-950/60 border border-rose-800 hover:bg-rose-900 text-rose-400 smooth-transition ml-1"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
}

/* ── section card wrapper ────────────────────────────── */
function Section({ icon: Icon, title, color, count, children, empty }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl border border-slate-800 p-6 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-widest">{title}</h2>
        </div>
        <span className="text-xs font-mono text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full">
          {count} items
        </span>
      </div>

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Icon className="w-10 h-10 text-slate-800 mb-3" />
          <p className="text-slate-600 text-xs font-mono">{empty}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-hide">
          <AnimatePresence>{children}</AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/* ── main dashboard ──────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useUser();

  // Derive real display name from Clerk: prefer full name, fall back to email prefix
  const realName = user
    ? (user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "StreamFlare User")
    : "StreamFlare User";

  const realAvatar = user?.imageUrl || null;

  const {
    favorites, watchlist, recentlyPlayed,
    hoursPlayed, hoursWatched,
    removeFavorite, removeFromWatchlist
  } = useUserStore();
  const { setCurrentTrack } = useMusicStore();

  const [selectedLang, setSelectedLang] = React.useState("All");
  const [activeTab, setActiveTab] = React.useState("overview");

  const favSongs  = favorites.filter((f) => f.type === "song");
  const favMovies = favorites.filter((f) => f.type === "movie");
  const langs     = React.useMemo(() => {
    const s = new Set(); favSongs.forEach((x) => x.language && s.add(x.language));
    return ["All", ...Array.from(s)];
  }, [favSongs]);
  const visibleSongs = selectedLang === "All" ? favSongs : favSongs.filter((s) => s.language === selectedLang);

  const activityData = useMemo(() => [
    { day: "Mon", watch: 2.4, play: 1.2 },
    { day: "Tue", watch: 3.1, play: 2.8 },
    { day: "Wed", watch: 1.8, play: 4.1 },
    { day: "Thu", watch: 4.2, play: 1.5 },
    { day: "Fri", watch: 3.5, play: 3.2 },
    { day: "Sat", watch: 5.8, play: 6.4 },
    { day: "Sun", watch: 6.2, play: 5.0 },
  ], []);

  const handlePlaySong = (song) => {
    setCurrentTrack({
      id: song.id, title: song.title,
      artist: song.artist || "Unknown Artist",
      album: song.album || "Favorites",
      duration: song.duration || "3:30",
      cover: song.cover || "/assets/m1.jpg",
      audioUrl: song.audioUrl || "/assets/m1.mp3",
    });
  };

  const stats = [
    { icon: Film,      label: "Hours Watched",   value: hoursWatched, suffix: "h",  color: "text-purple-400", bg: "from-purple-950/40 to-purple-900/10 border-purple-800/30" },
    { icon: Gamepad2,  label: "Hours Played",    value: hoursPlayed,  suffix: "h",  color: "text-cyan-400",   bg: "from-cyan-950/40 to-cyan-900/10 border-cyan-800/30" },
    { icon: Heart,     label: "Favourites",      value: favorites.length, suffix: "",color: "text-rose-400",  bg: "from-rose-950/40 to-rose-900/10 border-rose-800/30" },
    { icon: Eye,       label: "Watchlist",       value: watchlist.length, suffix: "",color: "text-amber-400", bg: "from-amber-950/40 to-amber-900/10 border-amber-800/30" },
  ];

  const tabs = [
    { id: "overview",  label: "Overview",        icon: LayoutGrid },
    { id: "favorites", label: "Favourites",      icon: Heart },
    { id: "watchlist", label: "Watchlist",       icon: Film },
    { id: "history",   label: "Recent",          icon: Clock },
  ];

  return (
    <AuthGate>
      <div className="space-y-8 select-none pb-28">

      {/* ── HERO PROFILE HEADER ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-800 p-8"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(6,182,212,0.08) 50%, rgba(236,72,153,0.08) 100%)"
        }}
      >
        {/* grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        {/* blobs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 rounded-full bg-cyan-600/10 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center shadow-neon-purple">
              {realAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={realAvatar} alt={realName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#020617]" />
          </div>

          {/* info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest border border-purple-800/60 bg-purple-950/40 px-2 py-0.5 rounded-full">Premium Member</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{realName}</h1>
            <p className="text-slate-400 text-sm mt-1">Your personal entertainment command center</p>
          </div>

          {/* quick stat badges */}
          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-950/30 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Active Now
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              {favorites.length + watchlist.length} total saved items
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── STATS GRID ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, suffix, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${bg} p-5`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <Counter value={value} suffix={suffix} />
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── TAB BAR ───────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-widest border smooth-transition whitespace-nowrap ${
              activeTab === id
                ? "bg-purple-600 border-purple-500 text-white shadow-neon-purple"
                : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 glass-panel rounded-3xl border border-slate-800 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-widest">Weekly Activity</h2>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Watch Hours</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Play Hours</div>
              </div>
            </div>
            <div className="h-52">
              <ActivityChart data={activityData} />
            </div>
          </motion.div>

          {/* Recently Played */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-3xl border border-slate-800 p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-widest">Recently Played</h2>
            </div>
            {recentlyPlayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Music className="w-10 h-10 text-slate-800 mb-3" />
                <p className="text-slate-600 text-xs font-mono">No plays yet. Start listening!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-hide">
                {recentlyPlayed.map((item) => (
                  <div key={item.id} onClick={() => item.type === "song" && handlePlaySong(item)} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-900/60 cursor-pointer group smooth-transition">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                      <BlurImage src={item.cover || "/assets/m1.jpg"} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.playedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    {item.type === "song" && (
                      <Play className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 smooth-transition" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { icon: Heart, label: "Favourite Songs",  value: favSongs.length,   color: "text-rose-400",   link: "#favorites" },
              { icon: Film,  label: "Saved Movies",     value: watchlist.length,  color: "text-purple-400", link: "#watchlist" },
              { icon: Radio, label: "Listening Streak", value: "7 days",          color: "text-cyan-400",   link: "#" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 cursor-pointer smooth-transition group">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 smooth-transition">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-lg font-black font-mono text-white">{value}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{label}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-700 ml-auto group-hover:text-slate-400 smooth-transition" />
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* ── FAVOURITES TAB ────────────────────────────── */}
      {activeTab === "favorites" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Favourite Songs */}
          <div className="flex flex-col gap-4">
            <Section icon={Music} title="Favourite Tracks" color="text-rose-400" count={visibleSongs.length} empty="Heart songs on the Music page to see them here.">
              {visibleSongs.map((song) => (
                <MediaCard key={song.id} item={song} type="song" onPlay={handlePlaySong} onRemove={removeFavorite} />
              ))}
            </Section>

            {/* language filter */}
            {favSongs.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {langs.map((lang) => (
                  <button key={lang} onClick={() => setSelectedLang(lang)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest border smooth-transition ${
                      selectedLang === lang
                        ? "bg-rose-600 border-rose-500 text-white"
                        : "border-slate-800 text-slate-500 hover:text-white"
                    }`}>
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favourite Movies */}
          <Section icon={Film} title="Favourite Movies" color="text-purple-400" count={favMovies.length} empty="Like movies on the Movies page to save them here.">
            {favMovies.map((movie) => (
              <MediaCard key={movie.id} item={movie} type="movie" onRemove={removeFavorite} />
            ))}
          </Section>
        </div>
      )}

      {/* ── WATCHLIST TAB ─────────────────────────────── */}
      {activeTab === "watchlist" && (
        <Section icon={Eye} title="My Watchlist" color="text-amber-400" count={watchlist.length} empty="Add movies to your watchlist from the Movies page.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {watchlist.map((movie) => (
              <MediaCard key={movie.id} item={movie} type="movie" onRemove={removeFromWatchlist} />
            ))}
          </div>
        </Section>
      )}

      {/* ── RECENT HISTORY TAB ────────────────────────── */}
      {activeTab === "history" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl border border-slate-800 p-6"
        >
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-widest">Recently Played</h2>
            <span className="ml-auto text-xs font-mono text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full">
              {recentlyPlayed.length} items
            </span>
          </div>

          {recentlyPlayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-12 h-12 text-slate-800 mb-4" />
              <p className="text-slate-600 text-sm font-mono">No play history yet.</p>
              <p className="text-slate-700 text-xs mt-1">Start listening to songs to build your history.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentlyPlayed.map((item, i) => (
                <motion.div
                  key={`${item.id}-${i}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => item.type === "song" && handlePlaySong(item)}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70 cursor-pointer group smooth-transition"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                    <BlurImage src={item.cover || "/assets/m1.jpg"} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                    <p className="text-xs text-slate-500 font-mono">
                      {new Date(item.playedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {item.type === "song" && (
                    <div className="p-1.5 rounded-full bg-purple-600 opacity-0 group-hover:opacity-100 smooth-transition">
                      <Play className="w-3 h-3 fill-white text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      </div>
    </AuthGate>
  );
}
