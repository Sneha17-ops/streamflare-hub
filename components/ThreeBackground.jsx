"use client";

import React from "react";

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-50 w-full h-full bg-[#020617] overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.14),transparent_32%),linear-gradient(180deg,#020617 0%,#020617 100%)]" />

      {/* Large blurred color blobs */}
      <div className="absolute top-[-18%] left-[-12%] w-[46%] h-[46%] bg-purple-900/15 rounded-full blur-[160px] animate-blob-slow" />
      <div className="absolute bottom-[-18%] right-[-10%] w-[52%] h-[52%] bg-cyan-950/20 rounded-full blur-[180px] animate-blob-slower" />

      {/* Medium floating orbs */}
      <div className="absolute left-10 top-24 w-32 h-32 rounded-full bg-purple-600/20 blur-[36px] animate-orbit delay-0" />
      <div className="absolute right-20 top-40 w-24 h-24 rounded-full bg-cyan-400/18 blur-[24px] animate-orbit delay-1" />
      <div className="absolute left-[40%] bottom-20 w-28 h-28 rounded-full bg-pink-500/14 blur-[28px] animate-orbit delay-2" />

      {/* Subtle grid/scanlines */}
      <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />

      {/* Radiant highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.06),transparent_18%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.05),transparent_16%),radial-gradient(circle_at_65%_75%,rgba(168,85,247,0.05),transparent_20%)]" />

      {/* Inline keyframes for smoother animations without external CSS config */}
      <style>{`
        @keyframes blob-slow { 0%{transform:translate3d(0,0,0) scale(1)} 50%{transform:translate3d(6%, -4%, 0) scale(1.05)} 100%{transform:translate3d(0,0,0) scale(1)} }
        @keyframes blob-slower { 0%{transform:translate3d(0,0,0) scale(1)} 50%{transform:translate3d(-6%, 4%, 0) scale(1.06)} 100%{transform:translate3d(0,0,0) scale(1)} }
        @keyframes orbit { 0%{transform:translateY(0) translateX(0) scale(1)} 50%{transform:translateY(-18px) translateX(8px) scale(1.02)} 100%{transform:translateY(0) translateX(0) scale(1)} }
        .animate-blob-slow{animation:blob-slow 10s ease-in-out infinite}
        .animate-blob-slower{animation:blob-slower 14s ease-in-out infinite}
        .animate-orbit{animation:orbit 6s cubic-bezier(.22,.9,.3,1) infinite}
        .delay-0{animation-delay:0s}
        .delay-1{animation-delay:1.8s}
        .delay-2{animation-delay:3.2s}
      `}</style>
    </div>
  );
}
