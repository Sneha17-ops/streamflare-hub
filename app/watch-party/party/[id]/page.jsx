"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Send, Heart, Play, Pause, Users, Radio, Volume2, VolumeX, Maximize, Film } from "lucide-react";
import { GlassPanel, GlowButton, EqualizerBars, SectionHeader } from "@/components/ImmersiveKit";
import { io } from "socket.io-client";
import AuthGate from "@/components/AuthGate";

const VIDEO_SOURCES = [
  { id: "tears", title: "Tears of Steel (Sci-Fi Cyber)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", cover: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=300&auto=format&fit=crop" },
  { id: "sintel", title: "Sintel (Fantasy Quest)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", cover: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&auto=format&fit=crop" },
  { id: "bunny", title: "Big Buck Bunny (Animation)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop" }
];

const EMOJIS = ["🔥", "😂", "😮", "💖", "⚡", "🎉"];

export default function PartyRoomPage() {
  const { id } = useParams();
  const [party, setParty] = useState(null);
  const [chat, setChat] = useState("");
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState(VIDEO_SOURCES[0].url);
  const [floatingReactions, setFloatingReactions] = useState([]);
  
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    fetch(`/api/rooms/${id}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        setParty(data);
        if (data?.nowPlaying?.trackId) {
          // If room has specific content URL, we can map or use it
        }
      })
      .catch(() => setParty(null));
  }, [id]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join-room", {
      roomId: id,
      user: { name: `Guest_${Math.floor(Math.random() * 900) + 100}`, avatar: null },
    });

    socket.on("room-presence", ({ members }) => {
      setParty((current) => (current ? { ...current, participants: members || [] } : current));
    });

    socket.on("room-message", (payload) => {
      setParty((current) => {
        if (!current) return current;
        return { ...current, messages: [payload, ...(current.messages || [])] };
      });
    });

    socket.on("room-reaction", (payload) => {
      if (payload?.emoji) {
        triggerLocalReaction(payload.emoji);
      }
    });

    socket.on("watch-party-sync", (payload) => {
      isSyncingRef.current = true;
      
      if (payload?.activeVideoUrl && payload.activeVideoUrl !== activeVideoUrl) {
        setActiveVideoUrl(payload.activeVideoUrl);
        if (videoRef.current) {
          videoRef.current.src = payload.activeVideoUrl;
          videoRef.current.load();
        }
      }

      if (payload?.isPlaying !== undefined) {
        setPlaying(payload.isPlaying);
        if (videoRef.current) {
          if (payload.isPlaying) {
            videoRef.current.play().catch(() => {});
          } else {
            videoRef.current.pause();
          }
        }
      }

      if (payload?.time !== undefined && videoRef.current) {
        const diff = Math.abs(videoRef.current.currentTime - payload.time);
        if (diff > 1.8) {
          videoRef.current.currentTime = payload.time;
        }
      }

      setTimeout(() => {
        isSyncingRef.current = false;
      }, 200);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [id, activeVideoUrl]);

  // Sync volume slider to video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const sendChat = () => {
    if (!chat.trim()) return;
    const payload = {
      id: `${id}-${Date.now()}`,
      roomId: id,
      author: "You",
      text: chat,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setParty((current) => (current ? { ...current, messages: [payload, ...(current.messages || [])] } : current));
    socketRef.current?.emit("room-message", payload);
    setChat("");
  };

  const handleVideoPlay = () => {
    if (isSyncingRef.current) return;
    setPlaying(true);
    socketRef.current?.emit("watch-party-sync", {
      roomId: id,
      isPlaying: true,
      time: videoRef.current?.currentTime || 0,
      activeVideoUrl
    });
  };

  const handleVideoPause = () => {
    if (isSyncingRef.current) return;
    setPlaying(false);
    socketRef.current?.emit("watch-party-sync", {
      roomId: id,
      isPlaying: false,
      time: videoRef.current?.currentTime || 0,
      activeVideoUrl
    });
  };

  const handleSeek = (event) => {
    const percent = parseFloat(event.target.value);
    const newTime = percent * duration;
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    socketRef.current?.emit("watch-party-sync", {
      roomId: id,
      isPlaying: playing,
      time: newTime,
      activeVideoUrl
    });
  };

  const toggleMute = () => {
    setMuted(m => !m);
  };

  const handleSelectVideo = (source) => {
    setActiveVideoUrl(source.url);
    if (videoRef.current) {
      videoRef.current.src = source.url;
      videoRef.current.load();
      if (playing) {
        videoRef.current.play().catch(() => {});
      }
    }
    socketRef.current?.emit("watch-party-sync", {
      roomId: id,
      isPlaying: playing,
      time: 0,
      activeVideoUrl: source.url
    });
  };

  const triggerLocalReaction = (emoji) => {
    const reaction = {
      id: Math.random().toString(),
      emoji,
      x: Math.random() * 70 + 15,
      delay: Math.random() * 0.2
    };
    setFloatingReactions(prev => [...prev, reaction]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 2000);
  };

  const emitReaction = (emoji) => {
    triggerLocalReaction(emoji);
    socketRef.current?.emit("room-reaction", { roomId: id, emoji });
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const requestFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  if (!party) {
    return <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">Loading party...</div>;
  }

  return (
    <AuthGate>
      <div className="space-y-8 pb-12">
        <SectionHeader
          kicker="Watch Party Live"
          title={party.title}
          subtitle={party.description}
          actionHref="/watch-party"
          actionLabel="Leave party"
        />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          
          <div className="space-y-6">
            <GlassPanel className="p-6 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300">Party Room Code</p>
                  <h2 className="mt-1.5 text-2xl font-black text-white">{party.inviteCode || id}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <GlowButton variant="secondary" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Invite link copied to clipboard!");
                  }}>
                    <Copy className="h-4 w-4" />
                    Copy link
                  </GlowButton>
                </div>
              </div>

              {/* Synchronized video player viewport */}
              <div className="relative group rounded-2xl border border-white/10 bg-black aspect-video overflow-hidden shadow-2xl">
                <video
                  ref={videoRef}
                  src={activeVideoUrl}
                  className="w-full h-full object-contain"
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
                  onDurationChange={() => videoRef.current && setDuration(videoRef.current.duration)}
                />

                {/* Floating reaction animations overlay */}
                <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                  <AnimatePresence>
                    {floatingReactions.map((r) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: "100%", x: `${r.x}%`, scale: 0.8 }}
                        animate={{ opacity: 1, y: "10%", scale: [1, 1.4, 1.2] }}
                        exit={{ opacity: 0, y: "-20%", scale: 0.5 }}
                        transition={{ duration: 1.8, ease: "easeOut", delay: r.delay }}
                        className="absolute bottom-4 text-3xl select-none"
                      >
                        {r.emoji}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Custom media player controls bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          if (playing) videoRef.current.pause();
                          else videoRef.current.play().catch(() => {});
                        }
                      }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                    >
                      {playing ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
                    </button>

                    <span className="text-xs font-mono text-slate-300">
                      {formatTime(currentTime)}
                    </span>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.001"
                      value={duration ? currentTime / duration : 0}
                      onChange={handleSeek}
                      className="flex-1 accent-cyan-400 h-1 bg-white/25 rounded-lg appearance-none cursor-pointer"
                    />

                    <span className="text-xs font-mono text-slate-300">
                      {formatTime(duration)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button onClick={toggleMute} className="p-2 text-slate-300 hover:text-white transition">
                        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          setMuted(false);
                        }}
                        className="w-16 accent-cyan-400 h-1 bg-white/25 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <button onClick={requestFullscreen} className="p-2 text-slate-300 hover:text-white transition">
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Reaction emitter buttons panel */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-2">React Live:</span>
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => emitReaction(emoji)}
                      className="text-2xl p-1.5 hover:scale-125 transition active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Party Status:</span>
                  <span className="flex items-center gap-1.5 text-xs text-cyan-300">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    Sync Active
                  </span>
                </div>
              </div>
            </GlassPanel>

            {/* Video selector channels */}
            <GlassPanel className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Film className="h-5 w-5 text-cyan-300" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Switch Cinema Streams</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {VIDEO_SOURCES.map((source) => {
                  const isActive = activeVideoUrl === source.url;
                  return (
                    <button
                      key={source.id}
                      onClick={() => handleSelectVideo(source)}
                      className={`group relative flex flex-col items-left text-left overflow-hidden rounded-xl border p-2 transition ${
                        isActive ? "border-cyan-400 bg-cyan-400/10" : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-900 mb-2">
                        <img src={source.cover} alt={source.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      </div>
                      <span className="text-xs font-bold text-white truncate w-full">{source.title}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Click to Sync All</span>
                    </button>
                  );
                })}
              </div>
            </GlassPanel>
          </div>

          <div className="space-y-6">
            <GlassPanel className="p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-white">Live presence ({party.participants?.length || 1})</h2>
                <Users className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="space-y-3 max-h-[12rem] overflow-y-auto pr-1">
                {party.participants?.length > 0 ? (
                  party.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div>
                        <p className="text-sm font-bold text-white">{participant.name}</p>
                        <p className="text-xs text-slate-400">{participant.role || "Viewer"}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">
                        {participant.status || "Syncing"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div>
                      <p className="text-sm font-bold text-white">You</p>
                      <p className="text-xs text-slate-400">Host</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">Online</span>
                  </div>
                )}
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-white">Watch chat</h2>
                <Radio className="h-5 w-5 text-rose-300" />
              </div>
              <div className="space-y-3 max-h-[22rem] overflow-y-auto pr-1 flex flex-col-reverse">
                {(party.messages || []).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white">{entry.author}</p>
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">{entry.time}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-400">{entry.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <input
                  value={chat}
                  onChange={(event) => setChat(event.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="React to the moment..."
                  className="glass-input flex-1 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-650"
                />
                <button type="button" onClick={sendChat} className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </GlassPanel>
          </div>

        </div>
      </div>
    </AuthGate>
  );
}
