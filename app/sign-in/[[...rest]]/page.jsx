"use client";

import React, { useState, useEffect } from "react";
import { SignIn } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Film, Music, Gamepad2, Sparkles, Star, Shield, ArrowLeft, Zap, Play } from "lucide-react";

const FEATURES = [
  { icon: Film,     label: "20+ Premium Movies & Series",  color: "#a78bfa" },
  { icon: Music,    label: "25+ Music Tracks",              color: "#22d3ee" },
  { icon: Gamepad2, label: "Arcade & AAA Games",            color: "#f472b6" },
  { icon: Star,     label: "Personal Watchlist",            color: "#fbbf24" },
  { icon: Shield,   label: "Secure & Private",              color: "#34d399" },
  { icon: Sparkles, label: "AI-Powered Discovery",          color: "#fb7185" },
];

const ROTATING_WORDS = ["Movies", "Music", "Games", "Entertainment"];

export default function SignInCatchAllPage() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIndex((i) => (i + 1) % ROTATING_WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#020617",
        overflow: "hidden",
      }}
    >
      {/* ── LEFT BRANDING PANEL ─────────────────────────────────────── */}
      <div
        style={{
          display: "none",
          width: "50%",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          padding: "56px",
          overflow: "hidden",
        }}
        className="lg:flex"
      >
        {/* Gradient background */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(88,28,135,0.35) 0%, rgba(15,23,42,1) 50%, rgba(8,47,73,0.25) 100%)" }} />

        {/* Grid lines */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

        {/* Top border line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)" }} />

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          style={{ position: "absolute", top: "20%", left: "-60px", width: "340px", height: "340px", borderRadius: "50%", background: "rgba(139,92,246,0.15)", filter: "blur(60px)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1.5 }}
          style={{ position: "absolute", bottom: "20%", right: "20px", width: "260px", height: "260px", borderRadius: "50%", background: "rgba(6,182,212,0.12)", filter: "blur(50px)" }}
        />

        {/* ── CONTENT ── */}
        <div style={{ position: "relative", zIndex: 10 }}>
          {/* Back link */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "12px", fontFamily: "monospace", marginBottom: "40px", textDecoration: "none" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
          >
            <ArrowLeft style={{ width: 13, height: 13 }} />
            Back to home
          </Link>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "44px" }}>
            <div style={{ position: "relative", width: 44, height: 44, borderRadius: "12px", background: "linear-gradient(135deg, #7c3aed, #22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(139,92,246,0.5)" }}>
              <span style={{ fontWeight: 900, color: "#fff", fontSize: "16px", fontFamily: "monospace" }}>SF</span>
            </div>
            <span style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", fontFamily: "monospace" }}>
              STREAM<span style={{ background: "linear-gradient(90deg, #a78bfa, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>FLARE</span>
            </span>
          </div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: "clamp(32px,3.5vw,48px)", fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: "16px" }}
          >
            Your cinema.
            <br />
            <span style={{ background: "linear-gradient(90deg, #a78bfa, #22d3ee, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your stage.
            </span>
            <br />
            Your arcade.
          </motion.h1>

          {/* Rotating word pill */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "36px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a78bfa", animation: "ping 1.5s ease infinite" }} />
            <span style={{ fontSize: "13px", color: "#94a3b8", fontFamily: "monospace" }}>
              Unlock your{" "}
              <AnimatePresence mode="wait">
                <motion.span
                  key={ROTATING_WORDS[wordIndex]}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: "inline-block", color: "#a78bfa", fontWeight: 700 }}
                >
                  {ROTATING_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
              {" "}hub
            </span>
          </div>

          {/* Feature grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0" }}
              >
                <div style={{ width: 30, height: 30, borderRadius: "8px", border: "1px solid #1e293b", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <f.icon style={{ width: 14, height: 14, color: f.color }} />
                </div>
                <span style={{ fontSize: "11px", color: "#cbd5e1", fontFamily: "monospace" }}>{f.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{ position: "relative", zIndex: 10, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "20px" }}
        >
          <div style={{ display: "flex", gap: "3px", marginBottom: "12px" }}>
            {[...Array(5)].map((_, i) => <Star key={i} style={{ width: 13, height: 13, color: "#fbbf24", fill: "#fbbf24" }} />)}
          </div>
          <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6, marginBottom: "14px" }}>
            "StreamFlare is unlike any other platform. The glassmorphic UI and seamless movie + music + games experience is truly cinematic."
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff" }}>A</div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#fff", margin: 0 }}>Aria Sterling</p>
              <p style={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace", margin: 0 }}>Early Access Member</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL: CLERK SIGN-IN ──────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
        }}
      >
        {/* Radial glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 40%, rgba(139,92,246,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(2,6,23,0) 0%, rgba(2,6,23,0.8) 100%)", pointerEvents: "none" }} />

        {/* Mobile logo (shown on small screens) */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }} className="lg:hidden">
          <div style={{ width: 44, height: 44, borderRadius: "12px", background: "linear-gradient(135deg, #7c3aed, #22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", boxShadow: "0 0 24px rgba(139,92,246,0.5)" }}>
            <span style={{ fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>SF</span>
          </div>
          <span style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", fontFamily: "monospace" }}>
            STREAM<span style={{ background: "linear-gradient(90deg, #a78bfa, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>FLARE</span>
          </span>
        </div>

        {/* Label above form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "440px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <p style={{ fontSize: "11px", fontFamily: "monospace", color: "#475569", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>Welcome back</p>
            <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#fff", margin: 0 }}>Sign in to your hub</h2>
          </div>

          {/* Clerk SignIn component */}
          <div style={{ borderRadius: "20px", overflow: "hidden", border: "1px solid #1e293b", boxShadow: "0 25px 60px rgba(0,0,0,0.7)" }}>
            <SignIn
              fallbackRedirectUrl="/dashboard"
              afterSignInUrl="/dashboard"
              appearance={{
                variables: {
                  colorPrimary: "#8b5cf6",
                  colorBackground: "#0f172a",
                  colorText: "#f8fafc",
                  colorTextSecondary: "#94a3b8",
                  colorInputBackground: "#1e293b",
                  colorInputText: "#f8fafc",
                  colorNeutral: "#475569",
                  borderRadius: "12px",
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  fontSize: "14px",
                },
                elements: {
                  rootBox: "w-full",
                  card: {
                    background: "#0f172a",
                    border: "none",
                    boxShadow: "none",
                    borderRadius: "0",
                  },
                  headerTitle: { color: "#f8fafc", fontWeight: "700" },
                  headerSubtitle: { color: "#94a3b8" },
                  socialButtonsBlockButton: {
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                  },
                  socialButtonsBlockButtonText: { color: "#f8fafc" },
                  dividerLine: { background: "#1e293b" },
                  dividerText: { color: "#475569" },
                  formFieldLabel: { color: "#cbd5e1" },
                  formFieldInput: {
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                  },
                  formButtonPrimary: {
                    background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                    fontWeight: "700",
                    letterSpacing: "0.05em",
                  },
                  footerActionLink: { color: "#a78bfa" },
                  footerActionText: { color: "#64748b" },
                  identityPreviewText: { color: "#f8fafc" },
                  identityPreviewEditButton: { color: "#a78bfa" },
                  otpCodeFieldInput: {
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                  },
                  alertText: { color: "#f8fafc" },
                  formResendCodeLink: { color: "#a78bfa" },
                },
              }}
            />
          </div>

          {/* Footer note */}
          <p style={{ textAlign: "center", fontSize: "11px", color: "#334155", marginTop: "20px", fontFamily: "monospace" }}>
            New to StreamFlare?{" "}
            <Link href="/sign-in" style={{ color: "#a78bfa", textDecoration: "none" }}>Create a free account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
