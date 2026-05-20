"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ShimmerCard() {
  return (
    <div className="relative overflow-hidden w-full h-[320px] rounded-2xl glass-panel p-4 flex flex-col justify-end space-y-3">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
      
      <div className="w-12 h-12 bg-white/5 rounded-full" />
      <div className="w-3/4 h-5 bg-white/10 rounded-md" />
      <div className="w-1/2 h-4 bg-white/5 rounded-md" />
      <div className="flex space-x-2 pt-2">
        <div className="w-16 h-8 bg-white/10 rounded-lg" />
        <div className="w-16 h-8 bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}

export function CircularLoader() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-purple-500/10" />
        <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-cyan-400/10" />
        <div className="absolute inset-2 rounded-full border-4 border-b-cyan-400 animate-spin [animation-direction:reverse]" />
      </div>
      <p className="text-sm font-semibold tracking-widest text-purple-400/80 uppercase animate-pulse">Buffering Spatial Core...</p>
    </div>
  );
}

export function PageWipe({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617] backdrop-blur-xl"
        >
          <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[100px] animate-pulse" />
          <CircularLoader />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
