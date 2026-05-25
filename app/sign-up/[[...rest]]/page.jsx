"use client";

import React, { useEffect, useRef, useState } from "react";
import { SignUp, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Film, Music, Gamepad2, Sparkles, Shield, Zap, Star } from "lucide-react";

/* ── Animated star particle ───────────────────────────────────────────── */
function StarField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = canvas.offsetWidth);
    let H = (canvas.height = canvas.offsetHeight);
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random(),
      speed: Math.random() * 0.003 + 0.001,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach((s) => {
        s.a += s.speed;
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(s.a));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,139,250,${alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ── Feature badge ────────────────────────────────────────────────────── */
function FeatureBadge({ icon: Icon, label, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-sm ${color}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-semibold">{label}</span>
    </motion.div>
  );
}

export default function SignUpPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = (searchParams?.get("redirectTo")) || "/dashboard";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Analytics
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "sign_up_page_view" }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isSignedIn && user) {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "sign_up", meta: { userId: user.id } }),
      }).catch(() => {});
    }
  }, [isSignedIn, user]);

  const features = [
    { icon: Film, label: "Cinematic movie streaming", color: "border-purple-500/30 bg-purple-950/20 text-purple-300", delay: 0.6 },
    { icon: Music, label: "Shared music listening rooms", color: "border-cyan-500/30 bg-cyan-950/20 text-cyan-300", delay: 0.7 },
    { icon: Gamepad2, label: "Retro & AAA arcade games", color: "border-pink-500/30 bg-pink-950/20 text-pink-300", delay: 0.8 },
    { icon: Sparkles, label: "AI mood recommendations", color: "border-amber-500/30 bg-amber-950/20 text-amber-300", delay: 0.9 },
    { icon: Shield, label: "Privacy-first, no tracking", color: "border-emerald-500/30 bg-emerald-950/20 text-emerald-300", delay: 1.0 },
    { icon: Zap, label: "Real-time sync & watch parties", color: "border-indigo-500/30 bg-indigo-950/20 text-indigo-300", delay: 1.1 },
  ];

  return (
    <div className="min-h-screen flex bg-[#020617] overflow-hidden">
      {/* ── LEFT PANEL: Branding ─────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Deep space background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(29,78,216,0.18) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(30,58,138,0.12) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 60%), linear-gradient(135deg, #010b1a 0%, #020617 60%, #01050f 100%)",
          }}
        />
        {/* Animated star field */}
        {mounted && <StarField />}

        {/* Animated glowing orbs */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-[15%] left-[20%] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(29,78,216,0.2) 0%, transparent 70%)", filter: "blur(40px)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] right-[10%] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(30,58,138,0.18) 0%, transparent 70%)", filter: "blur(40px)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
          className="absolute top-[55%] left-[10%] w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", filter: "blur(30px)" }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center shadow-lg">
              <span className="font-black text-white text-sm font-mono">SF</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 blur-sm opacity-60 animate-pulse" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white font-mono group-hover:text-cyan-400 transition-colors">
              STREAM<span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">FLARE</span>
            </span>
          </Link>
        </motion.div>

        {/* Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <p className="text-xs font-mono text-purple-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <span className="w-6 h-px bg-purple-500" />
              Premium Entertainment Hub
            </p>
            <h1 className="text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight mb-6">
              Everything you<br />
              love to{" "}
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                stream.
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Movies, music, and retro arcade games — all in one beautifully crafted, AI-powered hub.
              Sign up to unlock the complete experience.
            </p>
          </motion.div>

          {/* Feature badges */}
          <div className="mt-10 grid grid-cols-1 xl:grid-cols-2 gap-3 max-w-lg">
            {features.map((f) => (
              <FeatureBadge key={f.label} {...f} />
            ))}
          </div>
        </div>

        {/* Bottom stat strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="relative z-10 flex items-center gap-8 pt-6 border-t border-slate-800/60"
        >
          {[
            { value: "20+", label: "Movies" },
            { value: "50+", label: "Songs" },
            { value: "6+", label: "Games" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-black text-white font-mono">{value}</p>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">{label}</p>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-600">
            <Star className="w-3 h-3 text-amber-500" fill="currentColor" />
            <span className="font-mono">Trusted by creators worldwide</span>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL: Auth form ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Subtle right-panel glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.07) 0%, transparent 65%)",
          }}
        />

        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center">
              <span className="font-black text-white text-xs font-mono">SF</span>
            </div>
            <span className="text-lg font-black text-white font-mono tracking-tighter">
              STREAM<span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">FLARE</span>
            </span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              Create Account
            </h2>
            <p className="text-slate-400 text-sm">
              Sign up to access your personal entertainment hub
            </p>
          </div>

          {/* Clerk sign-up card */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "rgba(7, 10, 22, 0.8)",
              border: "1px solid rgba(139,92,246,0.2)",
              boxShadow: "0 0 60px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
              backdropFilter: "blur(24px)",
            }}
          >
            <div className="px-6 pt-6 pb-2">
              {/* Top accent line */}
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent mb-6" />
            </div>

            <div className="px-4 pb-6">
              <SignUp
                routing="path"
                path="/sign-up"
                appearance={{
                  variables: {
                    colorPrimary: "#9b5cff",
                    colorBackground: "transparent",
                    colorText: "#e2e8f0",
                    colorTextSecondary: "#94a3b8",
                    colorInputBackground: "rgba(15,23,42,0.7)",
                    colorInputText: "#e2e8f0",
                    colorNeutral: "#6b7280",
                    borderRadius: "14px",
                    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                    fontSize: "14px",
                  },
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none border-none p-0",
                    header: "hidden",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton:
                      "flex items-center justify-center gap-3 rounded-xl px-4 py-3 font-semibold text-sm text-white transition-all duration-300 hover:opacity-90",
                    socialButtonsBlockButtonText: "text-white font-semibold text-sm",
                    dividerLine: "bg-slate-800/60",
                    dividerText: "text-slate-600 text-xs font-mono",
                    formFieldLabel: "text-slate-400 text-xs font-medium uppercase tracking-wider mb-1",
                    formFieldInput:
                      "rounded-xl px-4 py-3 text-white text-sm border border-slate-700/50 focus:border-purple-500/60 focus:ring-0 focus:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all duration-300",
                    formButtonPrimary:
                      "rounded-xl px-6 py-3 font-bold text-white text-sm transition-all duration-300 hover:opacity-90 hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]",
                    footerActionLink: "text-purple-400 hover:text-purple-300 font-semibold",
                    footerActionText: "text-slate-500 text-sm",
                    footer: "mt-4",
                    identityPreviewText: "text-slate-300",
                    identityPreviewEditButton: "text-purple-400",
                    formFieldSuccessText: "text-emerald-400",
                    formFieldErrorText: "text-rose-400",
                    alertText: "text-rose-400",
                    otpCodeFieldInput:
                      "rounded-xl border border-slate-700 bg-slate-900/60 text-white text-center font-mono text-lg",
                  },
                }}
                fallbackRedirectUrl={redirectTo}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600 font-mono">
              © {new Date().getFullYear()} StreamFlare · All rights reserved
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
