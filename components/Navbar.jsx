"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Gamepad2, Film, Music, House, User } from "lucide-react";
import { useSearchStore } from "../store";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const pathname = usePathname();
  const setIsSearchOpen = useSearchStore((state) => state.setIsOpen);
  let user = null;
  try {
    const u = useUser();
    user = u?.user ?? null;
  } catch (err) {
    user = null;
  }
  const [scrolled, setScrolled] = useState(false);
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide navbar on auth pages
  if (isAuthPage) return null;

  const navLinks = [
    { name: "Homepage", path: "/", icon: House },
    { name: "Movies", path: "/movies", icon: Film },
    { name: "Music", path: "/music", icon: Music },
    { name: "Games", path: "/games", icon: Gamepad2 },
    { name: "Dashboard", path: "/dashboard", icon: User }
  ];

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 border-b ${
        scrolled 
          ? "bg-[#020617]/75 backdrop-blur-md border-slate-800/80 py-3.5" 
          : "bg-transparent border-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Brand Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center shadow-neon-purple group-hover:scale-105 smooth-transition">
            <span className="font-black text-white text-base font-mono">SF</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 blur-sm opacity-60 animate-pulse-slow" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white font-mono group-hover:text-cyan-400 transition-colors duration-300">
            STREAM<span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">FLARE</span>
          </span>
        </Link>

        {/* Global Navigation Links */}
        {user ? (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center space-x-1.5 p-1 bg-slate-950/40 border border-slate-800/60 rounded-full backdrop-blur-sm"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest smooth-transition ${
                    isActive 
                      ? "text-white" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-cyan-900/30 border border-purple-500/30 rounded-full -z-10"
                      style={{ transition: "all 0.18s" }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </motion.nav>
        ) : (
          <div className="hidden md:flex items-center px-4 py-2 rounded-full border border-slate-800 bg-slate-950/50 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
            Sign in to unlock the full hub
          </div>
        )}

        {/* Action Controls & Dashboard Panel */}
        <div className="flex items-center space-x-4">
          
          {/* Glassmorphic Global Search Bar Trigger */}
          {user ? (
            <>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-full bg-slate-900/60 border border-slate-850 hover:border-purple-500 hover:bg-slate-900 text-slate-400 hover:text-white smooth-transition"
                title="Index Search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
              <div className="relative">
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          ) : (
            <SignInButton>
              <button className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:scale-105 hover:shadow-neon-purple text-xs font-bold uppercase tracking-widest text-white smooth-transition">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </motion.header>
  );
}
