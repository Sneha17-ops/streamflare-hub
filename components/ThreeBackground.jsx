"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";

export default function ThreeBackground() {
  const containerRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. INITIALIZE SCENE & RENDERER ───────────────────────────────────────
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#020617", 0.045);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor("#020617", 1);
    container.appendChild(renderer.domElement);

    // ── 2. CREATE PARTICLES GEOMETRY ─────────────────────────────────────────
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const initialPositions = [];

    // Base colors based on active pages
    const getColorTheme = (path) => {
      const p = path || "";
      if (p.includes("/movies")) {
        // Horror / Action theme: Crimson red & Purple
        return {
          primary: new THREE.Color("#ec4899"), // pink
          secondary: new THREE.Color("#ef4444"), // red
          ambient: new THREE.Color("#6b21a8"), // purple
        };
      }
      if (p.includes("/music") || p.includes("/rooms")) {
        // Chill Lofi / Audio theme: Electric Cyan & Teal
        return {
          primary: new THREE.Color("#22d3ee"), // cyan
          secondary: new THREE.Color("#10b981"), // emerald
          ambient: new THREE.Color("#0369a1"), // blue
        };
      }
      if (p.includes("/games") || p.includes("/arcade")) {
        // Retro Arcade: Hot Orange & Pink Glow
        return {
          primary: new THREE.Color("#f43f5e"), // rose
          secondary: new THREE.Color("#f97316"), // orange
          ambient: new THREE.Color("#701a75"), // fuchsia
        };
      }
      if (p.includes("/leaderboard")) {
        // Prestige Amber / Gold
        return {
          primary: new THREE.Color("#fbbf24"), // amber
          secondary: new THREE.Color("#f59e0b"), // gold
          ambient: new THREE.Color("#78350f"), // brown
        };
      }
      // Default: Deep Purple nebula
      return {
        primary: new THREE.Color("#a855f7"), // purple
        secondary: new THREE.Color("#6366f1"), // indigo
        ambient: new THREE.Color("#1e1b4b"), // dark indigo
      };
    };

    let theme = getColorTheme(pathname);

    for (let i = 0; i < particleCount; i++) {
      // Create wave-like sheet in 3D
      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 45;
      const z = (Math.random() - 0.5) * 30;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositions.push({ x, y, z, seed: Math.random() * 100 });

      // Blend theme colors
      const mix = Math.random();
      const mixedColor = theme.primary.clone().lerp(theme.secondary, mix);
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      scales[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Particle shader/material for glowing soft circles
    const canvasMaterial = new THREE.PointsMaterial({
      size: 0.55,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Create a circular texture dynamically for soft glow particles without external PNG dependency
    const createCircleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext("2d");
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.3, "rgba(255, 255, 255, 0.8)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    canvasMaterial.map = createCircleTexture();

    const particleSystem = new THREE.Points(geometry, canvasMaterial);
    scene.add(particleSystem);

    // ── 3. CURSOR SPOTLIGHT TRACKING ──────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 15;
      targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 10;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // ── 4. RENDER & ANIMATION LOOP ───────────────────────────────────────────
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smoothly interpolate mouse coordinate changes
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Gently tilt cameras based on mouse coordinates
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (mouseY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Deconstruct geometry arrays to update particle wave
      const positionAttr = geometry.attributes.position;
      const colorAttr = geometry.attributes.color;

      // Smooth transition color themes if path changed
      const currentTheme = getColorTheme(pathname);
      theme.primary.lerp(currentTheme.primary, 0.03);
      theme.secondary.lerp(currentTheme.secondary, 0.03);
      theme.ambient.lerp(currentTheme.ambient, 0.03);

      for (let i = 0; i < particleCount; i++) {
        const init = initialPositions[i];
        
        // Calculate organic wave motions using sine and cosine frequencies
        const waveX = Math.sin(elapsedTime * 0.2 + init.seed) * 0.8;
        const waveY = Math.cos(elapsedTime * 0.15 + init.seed) * 0.6;
        const waveZ = Math.sin(elapsedTime * 0.25 + init.seed) * 0.7;

        positionAttr.setX(i, init.x + waveX);
        positionAttr.setY(i, init.y + waveY);
        positionAttr.setZ(i, init.z + waveZ);

        // Gently adjust color tones depending on wave positioning
        const mixRatio = Math.sin(elapsedTime * 0.4 + init.seed) * 0.5 + 0.5;
        const mixedColor = theme.primary.clone().lerp(theme.secondary, mixRatio);

        colorAttr.setXYZ(i, mixedColor.r, mixedColor.g, mixedColor.b);
      }

      positionAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      // Rotate whole system slightly
      particleSystem.rotation.y = elapsedTime * 0.015;
      particleSystem.rotation.x = elapsedTime * 0.008;

      renderer.render(scene, camera);
    };

    animate();

    // ── 5. HANDLE RESIZE events ──────────────────────────────────────────────
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // ── 6. CLEANUP HOOK ──────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-50 w-full h-full bg-[#020617] overflow-hidden pointer-events-none"
    />
  );
}
