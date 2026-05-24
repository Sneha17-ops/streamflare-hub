"use client";

import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Sphere } from "@react-three/drei";
import ErrorBoundary from "./ErrorBoundary";

function ReactiveCore({ isPlaying }) {
  const ref = useRef();

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * (isPlaying ? 0.55 : 0.18);
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={0.9}>
      <group ref={ref}>
        <Sphere args={[1.25, 64, 64]}>
          <meshStandardMaterial roughness={0.15} metalness={0.85} color={isPlaying ? "#22d3ee" : "#8b5cf6"} emissive={isPlaying ? "#0f766e" : "#3b0764"} emissiveIntensity={0.8} />
        </Sphere>
        <Sparkles count={80} scale={5} size={2.5} speed={0.8} color={isPlaying ? "#f472b6" : "#67e8f9"} />
      </group>
    </Float>
  );
}

export default function MusicVisualizer({ isPlaying = false, track = null, className = "" }) {
  const accent = useMemo(() => (isPlaying ? "from-cyan-400/20 via-fuchsia-500/15 to-amber-400/20" : "from-slate-300/10 via-slate-200/5 to-cyan-400/10"), [isPlaying]);

  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_50%)]" />
      <div className="relative grid min-h-[20rem] grid-cols-1 xl:grid-cols-[1fr_0.65fr]">
        <div className="relative min-h-[18rem]">
          <ErrorBoundary>
            <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={1.2} />
            <directionalLight position={[4, 4, 6]} intensity={2.5} color="#67e8f9" />
            <pointLight position={[-4, -4, 4]} intensity={2} color="#f472b6" />
            <Suspense fallback={null}>
              <ReactiveCore isPlaying={isPlaying} />
            </Suspense>
            </Canvas>
          </ErrorBoundary>
        </div>
        <div className="flex flex-col justify-between gap-5 p-6 md:p-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300">3D Audio Visualizer</p>
            <h3 className="mt-3 text-2xl font-black text-white">{track?.title || "Immersive sound field"}</h3>
            <p className="mt-2 text-sm text-slate-400">Particles, glow rings, and a reactive core built for a cinematic player experience.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Mode", value: isPlaying ? "Live" : "Idle" },
              { label: "Energy", value: isPlaying ? "92%" : "18%" },
              { label: "Depth", value: "Ultra" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-lg font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}