"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Copy, Share2, Send, Heart, MessageSquare, Users, Play, Pause, Radio, Settings2, Flame, Sparkles, Headphones, Compass } from "lucide-react";
import { EqualizerBars, GlassPanel, GlowButton, SectionHeader, VoiceOrb } from "@/components/ImmersiveKit";
import { io } from "socket.io-client";
import { useUser } from "@clerk/nextjs";
import AuthGate from "@/components/AuthGate";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id || "FLARE-LOUNGE";
  const { user } = useUser();
  const [room, setRoom] = useState(null);
  const [message, setMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [reactions, setReactions] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    let alive = true;
    async function loadRoom() {
      const response = await fetch(`/api/rooms/${roomId}`, { cache: "no-store" });
      const data = await response.json();
      if (!alive) return;
      setRoom(data);
    }
    loadRoom();
    return () => {
      alive = false;
    };
  }, [roomId]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join-room", {
      roomId,
      user: {
        name: user?.fullName || user?.firstName || "Guest",
        avatar: user?.imageUrl || null,
      },
    });

    socket.on("room-presence", ({ members }) => {
      setRoom((current) => (current ? { ...current, participants: members || [] } : current));
    });

    socket.on("room-message", (payload) => {
      setRoom((current) => {
        if (!current) return current;
        return {
          ...current,
          messages: [payload, ...(current.messages || [])],
        };
      });
    });

    socket.on("room-reaction", ({ emoji }) => {
      triggerLocalReaction(emoji);
    });

    socket.on("watch-party-sync", (payload) => {
      if (payload?.isPlaying !== undefined) {
        setIsPlaying(Boolean(payload.isPlaying));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, user]);

  const triggerLocalReaction = (emoji) => {
    const id = Math.random() + Date.now();
    // Randomize initial horizontal position and drift speed
    const x = Math.random() * 70 + 15; // float between 15% and 85% width
    const delay = Math.random() * 0.4;
    setReactions((prev) => [...prev, { id, emoji, x, delay }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2500);
  };

  const emitReaction = (emoji) => {
    triggerLocalReaction(emoji);
    socketRef.current?.emit("room-reaction", { roomId, emoji });
  };

  if (!room) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-300 backdrop-blur-md">
          <Radio className="h-8 w-8 animate-pulse text-cyan-300" />
          <p className="text-sm font-mono uppercase tracking-[0.2em]">Synchronizing deck state...</p>
        </div>
      </div>
    );
  }

  const sendMessage = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    const payload = {
      id: `${roomId}-${Date.now()}`,
      roomId,
      author: user?.fullName || user?.firstName || "You",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setRoom((current) => ({
      ...current,
      messages: [payload, ...(current.messages || [])],
    }));
    socketRef.current?.emit("room-message", payload);
    setMessage("");
  };

  const broadcastSync = () => {
    socketRef.current?.emit("watch-party-sync", { roomId, isPlaying: !isPlaying, time: 0 });
    setIsPlaying((current) => !current);
  };

  return (
    <AuthGate>
      <div className="space-y-8 pb-12">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400 transition hover:text-white clickable">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <SectionHeader
          kicker="Listening Lounge & Watch Room"
          title={room.title}
          subtitle={room.description}
          actionHref={`/watch-party/party/${roomId}`}
          actionLabel="Launch watch party"
        />

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <GlassPanel className="p-6 relative overflow-hidden">
            {/* Real-time floating reaction bubble stream overlay */}
            <div className="absolute inset-0 pointer-events-none z-30">
              <AnimatePresence>
                {reactions.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ y: "100%", x: `${r.x}%`, opacity: 0, scale: 0.6 }}
                    animate={{ 
                      y: "-15%", 
                      opacity: [0, 1, 0.9, 0],
                      scale: [0.6, 1.4, 1.4, 0.8],
                      rotate: Math.random() > 0.5 ? [0, 15, -15, 0] : [0, -15, 15, 0]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.2, ease: "easeOut", delay: r.delay }}
                    className="absolute bottom-0 text-3xl select-none filter drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                  >
                    {r.emoji}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">
                  <Radio className="h-3 w-3 text-cyan-300 animate-pulse" />
                  Invite Code: {room.inviteCode}
                </div>
                <h2 className="text-2xl font-black text-white">{room.nowPlaying?.trackTitle || "Atmospheric Lounge Live"}</h2>
                <p className="text-sm text-slate-400">{room.nowPlaying?.artist || "Ambient beats synced for all users"}</p>
              </div>
              <div className="flex items-center gap-3">
                <GlowButton variant="secondary" onClick={() => navigator.clipboard?.writeText(room.inviteCode || roomId)}>
                  <Copy className="h-4 w-4" />
                  Copy
                </GlowButton>
                <GlowButton variant="secondary">
                  <Share2 className="h-4 w-4" />
                  Invite
                </GlowButton>
              </div>
            </div>

            {/* Synthesizer playback deck */}
            <div className="mt-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/15 via-fuchsia-500/10 to-amber-400/15 p-6 relative">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between z-10 relative">
                <VoiceOrb active={isPlaying} text={isPlaying ? "Audio stream is synchronized. Float reactions with the beat!" : "Deck is paused. Sync ready to resume."} className="min-h-[12rem] flex-1 justify-start" />
                <div className="flex flex-1 flex-col gap-5 md:items-end">
                  <EqualizerBars active={isPlaying} className="h-14" />
                  <div className="flex items-center gap-3">
                    <GlowButton onClick={broadcastSync} className="shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isPlaying ? "Pause Lounge" : "Resume Lounge"}
                    </GlowButton>
                    <GlowButton variant="secondary">
                      <Settings2 className="h-4 w-4" />
                      Deck settings
                    </GlowButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Sync room reaction board */}
            <div className="mt-6 p-4 rounded-3xl border border-white/10 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Quick reaction burst</p>
                <p className="text-[10px] text-slate-500">Tap to float emojis live across all synced participant dashboards</p>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto">
                {[
                  { emoji: "🔥", label: "fire" },
                  { emoji: "✨", label: "sparkles" },
                  { emoji: "🎧", label: "lofi" },
                  { emoji: "💫", label: "cosmic" },
                  { emoji: "❤️", label: "love" },
                  { emoji: "🎉", label: "party" }
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => emitReaction(item.emoji)}
                    className="h-11 w-11 flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-xl transition hover:border-cyan-400/40 hover:bg-cyan-400/10 cursor-pointer"
                  >
                    {item.emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-2xl font-black text-cyan-300">{room.participants?.length || 0}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Synced users</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-2xl font-black text-rose-300">{room.messages?.length || 0}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Messages</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-2xl font-black text-amber-300">{room.queue?.length || 0}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Synced Q</p>
              </div>
            </div>
          </GlassPanel>

          <div className="space-y-6">
            <GlassPanel className="p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-white">Live participants</h2>
                <Users className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {(room.participants || []).map((participant, index) => (
                    <motion.div 
                      key={participant.id || index} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 smooth-transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full border border-white/10 overflow-hidden bg-slate-800">
                          {participant.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={participant.avatar} alt={participant.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-cyan-400">
                              {participant.name?.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{participant.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono tracking-wider">{participant.role || "LISTENER"}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {participant.status || "Online"}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-white">Room chat</h2>
                <MessageSquare className="h-5 w-5 text-rose-300" />
              </div>
              <div className="max-h-80 space-y-3 overflow-y-auto pr-1 flex flex-col-reverse">
                <AnimatePresence>
                  {(room.messages || []).map((entry, index) => (
                    <motion.div 
                      key={entry.id || index} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-white/10 bg-black/20 p-3 hover:border-white/20 transition"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold text-white font-mono">{entry.author}</p>
                        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">{entry.time}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-300 leading-relaxed">{entry.text}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <form onSubmit={sendMessage} className="mt-4 flex gap-3">
                <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Say something in the room..." className="glass-input flex-1 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none border border-white/10 focus:border-cyan-400/50 bg-black/30" />
                <button className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.02] hover:bg-cyan-300 active:scale-95 cursor-pointer">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </GlassPanel>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
