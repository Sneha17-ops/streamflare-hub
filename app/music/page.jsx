"use client";
export const dynamic = 'force-dynamic';


import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music, Play, Pause, Search, Heart, Radio,
  Clock, Disc, ChevronRight, Users, X
} from "lucide-react";
import { fetchTrendingSongs } from "../../lib/api";
import { useMusicStore, useUserStore } from "../../store";
import BlurImage from "../../components/BlurImage";
import nextDynamic from "next/dynamic";
import AuthGate from "@/components/AuthGate";

const MusicVisualizer = nextDynamic(() => import("../../components/MusicVisualizer"), { ssr: false });

const fmtDur = (s) => {
  const n = parseInt(s);
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
};

const LANGUAGES = ["All", "Hindi", "English", "Punjabi", "Tamil", "Telugu", "Bengali", "Gujarati", "Bhojpuri", "Urdu", "Marathi", "Kannada", "Malayalam", "Assamese", "Nepali", "Korean", "Spanish", "Arabic", "Japanese", "Odia", "Haryanvi", "Rajasthani"];

function SongCard({ song, index, onPlay, isActive, isPlaying }) {
  const { favorites, addFavorite, removeFavorite } = useUserStore();
  const isFav = favorites.some((f) => f.id === song.id);

  const toggleFav = (e) => {
    e.stopPropagation();
    if (isFav) removeFavorite(song.id);
    else addFavorite({ id: song.id, type: "song", title: song.title, cover: song.cover, language: song.language });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onPlay(song)}
      className={`group relative flex items-center gap-4 p-4 rounded-2xl border cursor-pointer smooth-transition ${
        isActive
          ? "border-purple-500/50 bg-purple-950/30 shadow-neon-purple"
          : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
      }`}
    >
      {/* Album Art */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
        <BlurImage src={song.cover} alt={song.title} fill className="object-cover" />
        <div className={`absolute inset-0 flex items-center justify-center smooth-transition ${
          isActive ? "bg-purple-900/60" : "bg-black/0 group-hover:bg-black/50"
        }`}>
          {isActive
            ? (isPlaying
                ? <Pause className="w-5 h-5 text-white fill-white" />
                : <Play className="w-5 h-5 text-white fill-white" />)
            : <Play className="w-5 h-5 text-white fill-white opacity-0 group-hover:opacity-100 smooth-transition" />
          }
        </div>
        {isActive && isPlaying && (
          <div className="absolute bottom-1 right-1 flex gap-0.5 items-end">
            {[3, 5, 4].map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: [h, h + 4, h] }}
                transition={{ repeat: Infinity, duration: 0.6 + i * 0.2, ease: "easeInOut" }}
                className="w-1 rounded-full bg-purple-400"
                style={{ height: h }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${isActive ? "text-purple-300" : "text-white"}`}>{song.title}</p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{song.artist} · {song.album}</p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="hidden sm:block text-[10px] font-mono text-slate-600 border border-slate-800 px-1.5 py-0.5 rounded-full">
          {song.language}
        </span>
        <span className="text-xs font-mono text-slate-500">{fmtDur(song.duration)}</span>
        <button
          onClick={toggleFav}
          className={`p-1.5 rounded-full smooth-transition ${
            isFav ? "text-rose-400" : "text-slate-700 opacity-0 group-hover:opacity-100 hover:text-rose-400"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-rose-400" : ""}`} />
        </button>
      </div>
    </motion.div>
  );
}

export default function MusicPage() {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [roomDraft, setRoomDraft] = useState("FLARE-LOUNGE");

  const { currentTrack, isPlaying, setCurrentTrack, setIsPlaying, syncRoomId, setSyncRoomId } = useMusicStore();
  const { addRecentlyPlayed } = useUserStore();

  useEffect(() => {
    fetchTrendingSongs().then((data) => {
      setSongs(data);
      setFilteredSongs(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = songs;
    if (selectedLanguage !== "All") result = result.filter((s) => s.language === selectedLanguage);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.language.toLowerCase().includes(q)
      );
    }
    setFilteredSongs(result);
  }, [searchQuery, songs, selectedLanguage]);

  const handlePlay = (song) => {
    addRecentlyPlayed({ id: song.id, type: "song", title: song.title, cover: song.cover });
    if (currentTrack?.id === song.id) setIsPlaying(!isPlaying);
    else setCurrentTrack(song);
  };

  const langOptions = ["All", ...Array.from(new Set(songs.map((s) => s.language)))].filter(
    (l) => LANGUAGES.includes(l)
  );

  return (
    <AuthGate>
      <div className="space-y-8 select-none">

      <MusicVisualizer track={currentTrack} isPlaying={isPlaying} className="shadow-[0_0_50px_rgba(34,211,238,0.12)]" />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-800 p-8"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.08) 50%, rgba(236,72,153,0.08) 100%)"
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.12) 0%, transparent 60%)" }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30">
                <Music className="w-5 h-5 text-purple-400" />
              </div>
              <h1 className="text-3xl font-black text-white font-mono tracking-tight">Music Deck</h1>
            </div>
            <p className="text-slate-400 text-sm">
              {songs.length} tracks · {langOptions.length - 1} languages · Stream or sync with friends
            </p>
          </div>

          {/* Sync Room */}
          <div className="flex items-center gap-3">
            {syncRoomId ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono text-emerald-300">{syncRoomId}</span>
                <button onClick={() => setSyncRoomId(null)}>
                  <X className="w-3.5 h-3.5 text-emerald-400 hover:text-white smooth-transition" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowRoomInput((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-300 text-xs font-mono hover:border-purple-500/50 hover:text-white smooth-transition"
              >
                <Users className="w-4 h-4" />
                {showRoomInput ? "Cancel" : "Sync Room"}
              </button>
            )}
            {showRoomInput && !syncRoomId && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <input
                  value={roomDraft}
                  onChange={(e) => setRoomDraft(e.target.value)}
                  className="glass-input px-3 py-2 rounded-xl text-xs font-mono text-white w-36"
                  placeholder="Room name..."
                />
                <button
                  onClick={() => { if (roomDraft.trim()) { setSyncRoomId(roomDraft.trim()); setShowRoomInput(false); } }}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono smooth-transition"
                >
                  Join
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Now Playing mini */}
        <AnimatePresence>
          {currentTrack && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-10 mt-6 flex items-center gap-4 p-4 rounded-2xl border border-purple-500/20 bg-purple-950/20 backdrop-blur-sm"
            >
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <BlurImage src={currentTrack.cover} alt={currentTrack.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-0.5">Now Playing</p>
                <p className="text-sm font-bold text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-slate-500 truncate">{currentTrack.artist}</p>
              </div>
              <div className="flex gap-0.5 items-end mr-2">
                {[4, 7, 5, 8, 4].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={isPlaying ? { height: [h, h + 6, h] } : { height: 2 }}
                    transition={{ repeat: Infinity, duration: 0.5 + i * 0.15, ease: "easeInOut" }}
                    className="w-1 rounded-full bg-purple-400"
                    style={{ height: h }}
                  />
                ))}
              </div>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white smooth-transition shadow-neon-purple"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── SEARCH & FILTER ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600"
          />
        </div>
        <div className="flex gap-2 flex-wrap max-h-24 overflow-y-auto pr-1 scrollbar-hide">
          {langOptions.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold smooth-transition border ${
                selectedLanguage === lang
                  ? "bg-purple-600 border-purple-500 text-white shadow-neon-purple"
                  : "border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* ── STATS ROW ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Disc, label: "Total Tracks", value: songs.length },
          { icon: Radio, label: "Languages", value: langOptions.length - 1 },
          { icon: Clock, label: "Est. Duration", value: `${Math.round(songs.reduce((a, s) => a + parseInt(s.duration || 0), 0) / 60)} min` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass-panel rounded-2xl p-4 border border-slate-800 text-center">
            <Icon className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-xl font-black text-white font-mono">{value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── TRACKS LIST ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-400 font-mono uppercase tracking-widest">
            {filteredSongs.length} {selectedLanguage !== "All" ? selectedLanguage : ""} Tracks
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-20">
            <Music className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-mono text-sm">No tracks found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSongs.map((song, i) => (
              <SongCard
                key={song.id}
                song={song}
                index={i}
                onPlay={handlePlay}
                isActive={currentTrack?.id === song.id}
                isPlaying={isPlaying && currentTrack?.id === song.id}
              />
            ))}
          </div>
        )}
      </div>
      </div>
    </AuthGate>
  );
}
