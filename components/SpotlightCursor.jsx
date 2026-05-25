"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLayoutStore } from "../store";

export default function SpotlightCursor() {
  const setSpotlightCoords = useLayoutStore((state) => state.setSpotlightCoords);
  const pathname = usePathname();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState([]);
  const particleIdRef = useRef(0);

  // Determine neon glow color based on path
  const getGlowColor = (path) => {
    const p = path || "";
    if (p.includes("/movies")) {
      return {
        border: "border-pink-500/60",
        bg: "bg-pink-500/10",
        shadow: "rgba(236, 72, 153, 0.6)",
        trail: "bg-pink-500/40"
      };
    }
    if (p.includes("/music") || p.includes("/rooms")) {
      return {
        border: "border-blue-500/60",
        bg: "bg-blue-500/10",
        shadow: "rgba(59, 130, 246, 0.6)",
        trail: "bg-blue-500/40"
      };
    }
    if (p.includes("/games") || p.includes("/arcade")) {
      return {
        border: "border-rose-500/60",
        bg: "bg-rose-500/10",
        shadow: "rgba(244, 63, 94, 0.6)",
        trail: "bg-rose-500/40"
      };
    }
    if (p.includes("/leaderboard")) {
      return {
        border: "border-amber-400/60",
        bg: "bg-amber-400/10",
        shadow: "rgba(251, 191, 36, 0.6)",
        trail: "bg-amber-400/40"
      };
    }
    return {
      border: "border-purple-500/60",
      bg: "bg-purple-500/10",
      shadow: "rgba(168, 85, 247, 0.6)",
      trail: "bg-purple-500/40"
    };
  };

  const colors = getGlowColor(pathname);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setHidden(false);
      setPosition({ x: e.clientX, y: e.clientY });
      setSpotlightCoords(e.clientX, e.clientY);
      document.documentElement.style.setProperty("--x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--y", `${e.clientY}px`);
      if (Math.random() < 0.18) {
        createParticle(e.clientX, e.clientY);
      }
    };

    const handleMouseLeave = () => setHidden(true);
    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    // Dynamic hover listeners for magnetic scaling over interactive triggers
    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".clickable") ||
        target.getAttribute("role") === "button"
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [setSpotlightCoords]);

  const createParticle = (x, y) => {
    const id = particleIdRef.current++;
    const size = Math.random() * 4 + 2;
    setParticles((prev) => [...prev, { id, x, y, size }]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 800);
  };

  return (
    <>
      <div 
        className="pointer-events-none fixed inset-0 z-40 spotlight-mask select-none" 
        style={{
          transition: "opacity 0.6s ease"
        }}
      />

      {particles.map((p) => (
        <div
          key={p.id}
          className={`pointer-events-none fixed z-50 rounded-full blur-[1px] ${colors.trail}`}
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            transform: "translate(-50%, -50%)",
            animation: "fade-drift 0.8s forwards ease-out"
          }}
        />
      ))}

      {!hidden && (
        <div
          className={`pointer-events-none fixed z-50 rounded-full border transition-all duration-200 ease-out select-none mix-blend-screen hidden md:block ${colors.border} ${colors.bg}`}
          style={{
            left: position.x,
            top: position.y,
            width: clicked ? "44px" : isHovered ? "56px" : "24px",
            height: clicked ? "44px" : isHovered ? "56px" : "24px",
            transform: "translate(-50%, -50%)",
            boxShadow: clicked 
              ? `0 0 25px ${colors.shadow}` 
              : isHovered 
                ? `0 0 35px ${colors.shadow}`
                : `0 0 10px ${colors.shadow}`
          }}
        />
      )}

      <style jsx global>{`
        @keyframes fade-drift {
          0% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, calc(-50% - 25px)) scale(0.4);
          }
        }
      `}</style>
    </>
  );
}
