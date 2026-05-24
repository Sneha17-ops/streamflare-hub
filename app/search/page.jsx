"use client";
export const dynamic = 'force-dynamic';


import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Sparkles, Film, Music, Gamepad2, ArrowRight, Mic, MicOff, BrainCircuit, Loader2 } from "lucide-react";
import { useMusicStore } from "@/store";
import { useUserStore } from "@/store";
import { GlassPanel, GlowButton, SectionHeader } from "@/components/ImmersiveKit";
import BlurImage from "@/components/BlurImage";
import AuthGate from "@/components/AuthGate";

const EXAMPLES = ["show emotional sci-fi movies", "relaxing late night songs", "multiplayer action games", "dark psychological thrillers"];

import { Suspense } from "react";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(Boolean(initialQuery));
  const [payload, setPayload] = useState({ movies: [], songs: [], games: [], explanation: "" });
  const setCurrentTrack = useMusicStore((state) => state.setCurrentTrack);
  const { favorites, recentlyPlayed } = useUserStore();

  useEffect(() => {
    let alive = true;
    const handler = setTimeout(async () => {
      if (!query.trim()) {
        if (!alive) return;
        setPayload({ movies: [], songs: [], games: [], explanation: "Type a query and StreamFlare will interpret the intent." });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search/semantic?q=${encodeURIComponent(query)}&favorites=${encodeURIComponent(JSON.stringify(favorites))}&recent=${encodeURIComponent(JSON.stringify(recentlyPlayed))}`);
        const data = await response.json();
        if (!alive) return;
        setPayload(data);
      } finally {
        if (alive) setLoading(false);
      }
    }, 200);

    return () => {
      alive = false;
      clearTimeout(handler);
    };
  }, [query]);

  const headline = useMemo(() => payload.explanation || "AI semantic discovery is ready.", [payload]);

  const handlePlaySong = (song) => {
    setCurrentTrack(song);
    router.push("/music");
  };

  return (
    <AuthGate>
      <div className="space-y-8 pb-12">
      <SectionHeader
        kicker="Semantic Search"
        title="Describe what you want. The platform understands the intent."
        subtitle="This route is shareable, deep-link friendly, and powered by the same AI search engine behind the global overlay."
        actionHref="/moods"
        actionLabel="Browse moods"
      />

      <GlassPanel className="p-6">
        <div className="space-y-5">
          <div className="relative">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try: relaxing late night songs"
              className="w-full rounded-3xl border border-white/10 bg-slate-950/50 py-5 pl-16 pr-16 text-lg text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
            />
            <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <button className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-400/40 hover:text-white">
              <Mic className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {EXAMPLES.map((item) => (
              <button key={item} onClick={() => setQuery(item)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white">
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
            <BrainCircuit className="h-4 w-4 text-cyan-300" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">{headline}</p>
              <p className="text-xs text-slate-500">{loading ? "Scanning movies, songs, and games..." : "Pinned to /search so it can be shared and bookmarked."}</p>
            </div>
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-cyan-300" /> : null}
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-6 xl:grid-cols-3">
        <ResultSection
          title="Movies"
          icon={Film}
          accent="text-purple-400"
          items={payload.movies || []}
          empty="Type a richer query to surface cinematic intent."
          renderItem={(movie) => (
            <Link key={movie.id} href={`/movies/${movie.id}`} className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10">
              <div className="h-16 w-12 overflow-hidden rounded-2xl border border-white/10">
                <BlurImage src={movie.poster_path} alt={movie.title} width={48} height={64} className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{movie.title}</p>
                <p className="truncate text-xs text-slate-400">{movie.genre}</p>
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{movie.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
            </Link>
          )}
        />

        <ResultSection
          title="Songs"
          icon={Music}
          accent="text-cyan-400"
          items={payload.songs || []}
          empty="Audio matches will appear here."
          renderItem={(song) => (
            <button key={song.id} onClick={() => handlePlaySong(song)} className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-white/20 hover:bg-white/10">
              <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10">
                <BlurImage src={song.cover} alt={song.title} width={56} height={56} className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{song.title}</p>
                <p className="truncate text-xs text-slate-400">{song.artist}</p>
                <p className="mt-1 text-[11px] text-slate-500">{song.album}</p>
              </div>
              <PlayPill />
            </button>
          )}
        />

        <ResultSection
          title="Games"
          icon={Gamepad2}
          accent="text-pink-400"
          items={payload.games || []}
          empty="Game intent will resolve here."
          renderItem={(game) => (
            <Link key={game.id} href="/arcade" className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10">
              <div className="h-14 w-16 overflow-hidden rounded-2xl border border-white/10">
                <BlurImage src={game.cover} alt={game.title} width={64} height={56} className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{game.title}</p>
                <p className="truncate text-xs text-slate-400">{game.category}</p>
                <p className="mt-1 text-[11px] text-slate-500">{game.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
            </Link>
          )}
        />
      </div>
      </div>
    </AuthGate>
  );
}

function ResultSection({ title, icon: Icon, accent, items, empty, renderItem }) {
  return (
    <GlassPanel className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accent}`} />
        <h2 className="text-sm font-bold uppercase tracking-widest text-white">{title} ({items.length})</h2>
      </div>
      <div className="space-y-3">
        {items.length > 0 ? items.map((item) => renderItem(item)) : <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-xs text-slate-500">{empty}</div>}
      </div>
    </GlassPanel>
  );
}

function PlayPill() {
  return <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-slate-950"><Sparkles className="h-4 w-4" /></div>;
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
