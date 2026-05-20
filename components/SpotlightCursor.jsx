"use client";

import React, { useEffect, useState, useRef } from "react";
import { useLayoutStore } from "../store";

export default function SpotlightCursor() {
  const setSpotlightCoords = useLayoutStore((state) => state.setSpotlightCoords);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [particles, setParticles] = useState([]);
  const particleIdRef = useRef(0);

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

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
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
          className="pointer-events-none fixed z-50 rounded-full bg-purple-500/40 blur-[1px]"
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
          className={`pointer-events-none fixed z-50 rounded-full border border-cyan-400/50 bg-cyan-400/5 transition-transform duration-100 ease-out select-none mix-blend-screen hidden md:block`}
          style={{
            left: position.x,
            top: position.y,
            width: clicked ? "32px" : "24px",
            height: clicked ? "32px" : "24px",
            transform: "translate(-50%, -50%)",
            boxShadow: clicked 
              ? "0 0 15px rgba(34, 211, 238, 0.6)" 
              : "0 0 8px rgba(34, 211, 238, 0.2)"
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
