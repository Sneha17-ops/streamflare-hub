"use client";
export const dynamic = 'force-dynamic';


import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, BrainCircuit, Film, Music2, Gamepad2, Wand2, ArrowRight, Loader2 } from "lucide-react";
import { getMoodOptions, getMoodConfig } from "@/lib/streamflare-ai";
import { GlowButton, GlassPanel, MoodCard, RecommendationCarousel, SectionHeader, VoiceOrb } from "@/components/ImmersiveKit";
import { useUserStore, useLayoutStore } from "@/store";
import AuthGate from "@/components/AuthGate";

const DEFAULT_MOOD = "Chill";

export default function MoodsPage() {
  const router = useRouter();
  const moods = useMemo(() => getMoodOptions(), []);
  const { selectedMood, setSelectedMood } = useLayoutStore();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const { favorites, recentlyPlayed } = useUserStore();

  const moodConfig = useMemo(() => getMoodConfig(selectedMood), [selectedMood]);

  const dynamicGradient = useMemo(() => {
    if (!moodConfig || !moodConfig.colors) return "from-cyan-400/10 via-fuchsia-500/10 to-amber-400/10";
    return moodConfig.colors
      .split(" ")
      .map((cls) => `${cls}/15`)
      .join(" ");
  }, [moodConfig]);

  const toneTextColor = useMemo(() => {
    const tones = {
      radiant: "text-amber-400",
      blue: "text-blue-400",
      rose: "text-rose-400",
      crimson: "text-red-400",
      teal: "text-cyan-300",
      violet: "text-violet-400",
      indigo: "text-indigo-400",
      emerald: "text-emerald-400",
      gold: "text-yellow-400",
      mist: "text-slate-300",
    };
    return tones[moodConfig?.tone] || "text-cyan-300";
  }, [moodConfig]);

  useEffect(() => {
    let alive = true;
    async function loadRecommendations() {
      setLoading(true);
      const response = await fetch(`/api/ai/recommendations?mood=${encodeURIComponent(selectedMood)}&query=${encodeURIComponent(query)}&favorites=${encodeURIComponent(JSON.stringify(favorites))}&recent=${encodeURIComponent(JSON.stringify(recentlyPlayed))}`);
      const data = await response.json();
      if (!alive) return;
      setPayload(data);
      setLoading(false);
    }
    loadRecommendations();
    return () => {
      alive = false;
    };
  }, [selectedMood, query, favorites, recentlyPlayed]);

  const moodDescription = payload?.mood?.description || "Choose a mood and StreamFlare will rebuild the room around it.";

  return (
    <AuthGate>
      <div className="space-y-8 pb-12">
      <SectionHeader
        kicker="AI Mood Engine"
        title="Pick a mood. The ecosystem adapts in real time."
        subtitle="Movies, songs, and games are re-ranked by a semantic AI layer so the whole platform feels emotionally aware."
        actionHref="/rooms"
        actionLabel="Enter Rooms"
      />

      <GlassPanel className="p-6">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/20 p-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-300">
                  <BrainCircuit className="h-3 w-3 text-cyan-300" />
                  Mood Query
                </div>
                <p className="max-w-xl text-sm text-slate-400">Type a context like "late night chill" or "romantic sci-fi" and the recommendations will reflow instantly.</p>
              </div>
              <GlowButton variant="secondary" onClick={() => router.push("/watch-party")}>Start a party</GlowButton>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {moods.map((mood) => (
                <MoodCard
                  key={mood.id}
                  mood={mood}
                  active={selectedMood === mood.label}
                  score={selectedMood === mood.label ? "Live" : null}
                  onClick={() => setSelectedMood(mood.label)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5">
            <VoiceOrb active text={moodDescription} className="min-h-[14rem]" />
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Mood overlay</label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Wand2 className="h-4 w-4 text-cyan-300" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Example: relaxing late night songs"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center"><Film className="mx-auto mb-2 h-4 w-4 text-purple-300" />Movies</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center"><Music2 className="mx-auto mb-2 h-4 w-4 text-cyan-300" />Songs</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center"><Gamepad2 className="mx-auto mb-2 h-4 w-4 text-rose-300" />Games</div>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-20 text-slate-300">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em]">
              <Loader2 className={`h-4 w-4 animate-spin ${toneTextColor}`} />
              Rendering personalized signal
            </div>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="space-y-6">
            <div className={`rounded-3xl border border-white/10 bg-gradient-to-r ${dynamicGradient} p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.35em] ${toneTextColor}`}>AI Recommendation Summary</p>
                  <h2 className="mt-2 text-2xl font-black text-white">{selectedMood} mode is locked in.</h2>
                  <p className="mt-2 max-w-3xl text-sm text-slate-300">{payload?.description}</p>
                </div>
                <GlowButton href="/leaderboard">View leaderboard</GlowButton>
              </div>
            </div>

            <RecommendationCarousel
              title="Movies"
              subtitle="Cinematic matches that align with the current emotional state."
              items={payload?.movies || []}
              accent="cyan"
              onPick={(item) => router.push(`/movies/${item.id}`)}
            />
            <RecommendationCarousel
              title="Songs"
              subtitle="Audio picks ranked by sentiment, tempo, and lyric energy."
              items={payload?.songs || []}
              accent="rose"
              onPick={() => router.push("/music")}
            />
            <RecommendationCarousel
              title="Games"
              subtitle="Instant play suggestions and multiplayer-ready experiences."
              items={payload?.games || []}
              accent="amber"
              onPick={() => router.push("/arcade")}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </AuthGate>
  );
}
