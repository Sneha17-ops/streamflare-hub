"use client";
export const dynamic = 'force-dynamic';


import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Radio, Users, MessagesSquare, PlayCircle, Shield, ArrowRight, Sparkles } from "lucide-react";
import { generateRoomCode } from "@/lib/streamflare-ai";
import { GlowButton, GlassPanel, SectionHeader, StatTile } from "@/components/ImmersiveKit";
import AuthGate from "@/components/AuthGate";

const ROOM_TYPES = ["music", "watch-party", "mixed"];

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "Neon Lounge", type: "music", description: "A premium synchronized room for live listening and chat." });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let alive = true;
    async function loadRooms() {
      const response = await fetch("/api/rooms", { cache: "no-store" });
      const data = await response.json();
      if (!alive) return;
      setRooms(data);
      setLoading(false);
    }
    loadRooms();
    return () => {
      alive = false;
    };
  }, []);

  const createRoom = async () => {
    setCreating(true);
    const roomId = generateRoomCode("FLARE");
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, roomId, inviteCode: roomId }),
    });
    const created = await response.json();
    setRooms((current) => [created, ...current]);
    setCreating(false);
  };

  return (
    <AuthGate>
      <div className="space-y-8 pb-12">
      <SectionHeader
        kicker="Realtime Rooms"
        title="Create a synchronized room for listening, reactions, and live chat."
        subtitle="Discord-grade presence, Spotify-style playback sync, and a premium room code system built for real-time entertainment."
        actionHref="/watch-party"
        actionLabel="Watch parties"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatTile label="Active rooms" value={rooms.length || 3} icon={Radio} tone="cyan" />
        <StatTile label="Live participants" value={(rooms.reduce((sum, room) => sum + (room.participants || 0), 0)) || 48} icon={Users} tone="emerald" />
        <StatTile label="Chats per minute" value="126" icon={MessagesSquare} tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-300"><Plus className="h-4 w-4" /></div>
            <div>
              <h2 className="text-lg font-black text-white">Create room</h2>
              <p className="text-xs text-slate-400">Spin up a private room in one click.</p>
            </div>
          </div>
          <div className="space-y-4">
            <input value={form.title} onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))} className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600" placeholder="Room title" />
            <textarea value={form.description} onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))} rows={3} className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600" placeholder="Room description" />
            <div className="grid grid-cols-3 gap-2">
              {ROOM_TYPES.map((type) => (
                <button key={type} type="button" onClick={() => setForm((state) => ({ ...state, type }))} className={`rounded-2xl border px-3 py-3 text-[10px] font-bold uppercase tracking-[0.25em] transition ${form.type === type ? "border-cyan-400/50 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-slate-400"}`}>
                  {type}
                </button>
              ))}
            </div>
            <GlowButton onClick={createRoom} className="w-full justify-center" disabled={creating}>
              {creating ? "Launching..." : "Launch room"}
            </GlowButton>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">Active rooms</h2>
              <p className="text-xs text-slate-400">Live room presence with queue and invite details.</p>
            </div>
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
                ))}
              </div>
            ) : (
              rooms.map((room) => (
                <motion.div key={room.id} whileHover={{ y: -4 }} className="rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-white">{room.title}</h3>
                        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-300">{room.type}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">{room.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                        <span>{room.participants} participants</span>
                        <span>{room.queueCount} queued</span>
                        <span>{room.inviteCode}</span>
                      </div>
                    </div>
                    <Link href={`/rooms/${room.id}`} className="inline-flex items-center gap-1 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-200 transition hover:bg-cyan-400/20">
                      Join
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </GlassPanel>
      </div>
      </div>
    </AuthGate>
  );
}
