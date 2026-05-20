"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, RotateCcw, Volume2, VolumeX } from "lucide-react";

export default function ArcadeModal({ isOpen, onClose, gameUrl, gameTitle }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const reloadGame = () => {
    setIframeKey((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-8"
        >
          <div className="absolute inset-0 -z-10 bg-radial-gradient from-purple-600/10 to-transparent blur-[120px]" />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`relative flex flex-col w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-neon-purple smooth-transition ${
              isFullscreen ? "h-full max-w-full" : "h-[85vh] max-w-5xl"
            }`}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
                  Arcade Live System
                </span>
                <span className="text-sm font-semibold text-slate-300">|</span>
                <h3 className="text-lg font-bold text-white font-mono tracking-wide">{gameTitle}</h3>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={reloadGame}
                  title="Reboot Console"
                  className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 smooth-transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? "Unmute Audio" : "Mute Audio"}
                  className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 smooth-transition"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleFullscreen}
                  title="Toggle Fullscreen"
                  className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 smooth-transition"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-red-950/40 border border-red-900/60 hover:bg-red-950 text-red-400 hover:text-red-300 smooth-transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-black overflow-hidden">
              <iframe
                key={iframeKey}
                src={gameUrl}
                className="w-full h-full border-none pointer-events-auto"
                title="Retro Console View"
                sandbox="allow-scripts allow-same-origin"
              />

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.45)_100%)] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] opacity-10" />
            </div>

            <div className="px-8 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-8 font-mono text-[10px] text-slate-500">
                <div>
                  <span className="text-cyan-500/80">JOYSTICK:</span> MOUSE / KEYBOARD
                </div>
                <div>
                  <span className="text-cyan-500/80">SYSTEM:</span> HTML5 CANVAS EMULATOR
                </div>
              </div>
              <div className="flex space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
