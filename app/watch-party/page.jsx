"use client";
export const dynamic = 'force-dynamic';


import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, PlayCircle, HeartPulse, Users, ArrowRight } from "lucide-react";
import { SectionHeader, GlassPanel, GlowButton, StatTile } from "@/components/ImmersiveKit";
import AuthGate from "@/components/AuthGate";

export default function WatchPartyPage() {
  const [parties, setParties] = useState([]);

  useEffect(() => {
    fetch("/api/watch-party", { cache: "no-store" }).then((response) => response.json()).then(setParties).catch(() => setParties([]));
  }, []);

  return (
    <AuthGate>
      <div className="space-y-8 pb-12">
      <SectionHeader
        kicker="Watch Party"
        title="Synchronized viewing, reactions, and group chat in a cinematic control room."
        subtitle="This surface is built for trailers, live events, and shared watch sessions with room codes and presence-aware playback."
        actionHref="/moods"
        actionLabel="Try AI moods"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatTile label="Live parties" value={parties.length || 3} icon={Users} tone="cyan" />
        <StatTile label="Active reactions" value="204" icon={HeartPulse} tone="rose" />
        <StatTile label="Trailers queued" value="31" icon={PlayCircle} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel className="p-6">
          <h2 className="text-lg font-black text-white">Create or join a party</h2>
          <p className="mt-2 text-sm text-slate-400">Use the shared room code system for trailers, live co-viewing, and synchronized playback.</p>
          <div className="mt-6 space-y-4">
            <GlowButton href="/watch-party/party/CINE-CLUB">Enter Prime party</GlowButton>
            <GlowButton variant="secondary" href="/rooms">Open rooms</GlowButton>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-white">Public parties</h2>
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <div className="space-y-3">
            {parties.map((party) => (
              <div key={party.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-white">{party.title}</p>
                    <p className="text-xs text-slate-400">{party.description}</p>
                  </div>
                  <Link href={`/watch-party/party/${party.id}`} className="inline-flex items-center gap-1 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-200 transition hover:bg-cyan-400/20">
                    Join
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
      </div>
    </AuthGate>
  );
}
