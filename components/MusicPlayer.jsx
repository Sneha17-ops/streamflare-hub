"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMusicStore, useUserStore } from "../store";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Radio } from "lucide-react";
import { io } from "socket.io-client";
import BlurImage from "./BlurImage";

export default function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    equalizerActive,
    syncRoomId,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setCurrentTrack,
    setSyncRoomId
  } = useMusicStore();

  const addRecentlyPlayed = useUserStore((state) => state.addRecentlyPlayed);

  const audioRef = useRef(null);
  const socketRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [roomDraft, setRoomDraft] = useState("FLARE-LOUNGE");

  useEffect(() => {
    if (syncRoomId) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
      socketRef.current = io(socketUrl);
      
      socketRef.current.emit("join-music-room", syncRoomId);

      socketRef.current.on("music-sync", (data) => {
        if (audioRef.current) {
          if (Math.abs(audioRef.current.currentTime - data.time) > 1.8) {
            audioRef.current.currentTime = data.time;
          }
          if (data.isPlaying && audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
            setIsPlaying(true);
          } else if (!data.isPlaying && !audioRef.current.paused) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        }
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [syncRoomId, setIsPlaying]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTrackEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleTrackEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleTrackEnded);
    };
  }, [setCurrentTime, setDuration, setIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const handlePlayPause = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    
    if (syncRoomId && socketRef.current && currentTrack) {
      socketRef.current.emit("music-action", {
        roomId: syncRoomId,
        isPlaying: nextPlaying,
        time: audioRef.current?.currentTime || 0,
        trackId: currentTrack.id
      });
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    
    if (syncRoomId && socketRef.current && currentTrack) {
      socketRef.current.emit("music-action", {
        roomId: syncRoomId,
        isPlaying,
        time,
        trackId: currentTrack.id
      });
    }
  };

  const toggleMute = () => {
    if (muted) {
      setMuted(false);
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setMuted(true);
      setVolume(0);
    }
  };

  const triggerRoomSync = () => {
    if (syncRoomId) {
      setSyncRoomId(null);
    } else {
      setShowRoomInput((current) => !current);
    }
  };

  const confirmRoomSync = () => {
    const trimmedRoom = roomDraft.trim();
    if (!trimmedRoom) return;
    setSyncRoomId(trimmedRoom);
    setShowRoomInput(false);
  };

  if (!currentTrack) return null;

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 px-6 py-4 bg-slate-950/85 backdrop-blur-xl border-t border-slate-900 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
          {/* Track Artwork and Artist details */}
          <div className="flex items-center space-x-4 w-full md:w-1/4">
            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-neon-cyan border border-slate-800">
              <BlurImage src={currentTrack.cover} alt={currentTrack.title} width={56} height={56} className="object-cover" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-white text-sm truncate">{currentTrack.title}</h4>
              <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
            </div>
            
            {/* Cyber Equalizer visualizer */}
            {equalizerActive && isPlaying && (
              <div className="flex items-end space-x-0.5 h-6 shrink-0 pl-2">
                {[0.4, 0.8, 0.5, 0.9, 0.3].map((delay, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-cyan-400"
                    style={{
                      height: "100%",
                      animation: `equalize 1.2s ease-in-out infinite alternate`,
                      animationDelay: `${delay}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

        {/* Audio control deck */}
        <div className="flex flex-col items-center w-full md:w-2/4 space-y-2">
          <div className="flex items-center space-x-6">
            <button className="text-slate-400 hover:text-white smooth-transition">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-3.5 rounded-full bg-cyan-400 text-slate-950 hover:scale-105 hover:shadow-neon-cyan smooth-transition"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950" />}
            </button>
            <button className="text-slate-400 hover:text-white smooth-transition">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Seek Progress Bar */}
          <div className="flex items-center space-x-3 w-full max-w-lg font-mono text-[10px] text-slate-500">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Sound controls and WebSocket Lounge */}
        <div className="flex items-center justify-end space-x-5 w-full md:w-1/4">
          
          {/* Socket Sync trigger */}
          <button
            onClick={triggerRoomSync}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest smooth-transition ${
              syncRoomId
                ? "bg-purple-950/60 border-purple-500 text-purple-300 shadow-neon-purple"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{syncRoomId ? `LIVE: ${syncRoomId}` : "Sync Play"}</span>
          </button>

          <AnimatePresence>
            {showRoomInput && !syncRoomId && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                className="absolute bottom-[88px] right-6 md:right-12 w-[280px] rounded-2xl border border-slate-800 bg-slate-950/95 p-3 shadow-2xl"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400 mb-2">
                  Join room
                </div>
                <div className="flex gap-2">
                  <input
                    value={roomDraft}
                    onChange={(e) => setRoomDraft(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                    placeholder="FLARE-LOUNGE"
                  />
                  <button
                    onClick={confirmRoomSync}
                    className="rounded-xl bg-cyan-400 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-950"
                  >
                    Join
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Volume toggle */}
          <div className="flex items-center space-x-2">
            <button onClick={toggleMute} className="text-slate-400 hover:text-white smooth-transition">
              {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (muted) setMuted(false);
              }}
              className="w-16 md:w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes equalize {
          0% {
            transform: scaleY(0.15);
          }
          100% {
            transform: scaleY(1);
          }
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22d3ee;
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
}
