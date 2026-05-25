"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { THUMBNAIL_MODES, ASPECT_RATIOS, buildModePrompt, TYPOGRAPHY_PRESETS, getModePalette } from '@/lib/thumbnail-templates';
import { Download, Sparkles, Image, Type, Palette, Layers, Wand2, RefreshCw, Copy, Activity, Check } from 'lucide-react';
import { useUserStore } from '@/store';

const GOOGLE_FONTS = ['Inter', 'Orbitron', 'Bebas Neue', 'Anton', 'Cinzel', 'Rajdhani', 'Bungee', 'Montserrat'];

export default function ThumbnailEditor({ initial = {} }) {
  const setCustomBanner = useUserStore((state) => state.setCustomBanner);

  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const frameRef = useRef(null);
  const meshRef = useRef(null);
  const dragRef = useRef(false);

  const [mode, setMode] = useState(initial.mode || 'cinematic');
  const [headline, setHeadline] = useState(initial.title || 'STREAMFLARE');
  const [overlay, setOverlay] = useState(initial.overlay || 'AI-generated poster concept');
  const [palette, setPalette] = useState(getModePalette(initial.mode || 'cinematic'));
  const [ratio, setRatio] = useState(ASPECT_RATIOS[0]);
  const [typography, setTypography] = useState(TYPOGRAPHY_PRESETS[initial.mode || 'cinematic']);
  const [textColor, setTextColor] = useState('#ffffff');
  const [shadowEnabled, setShadowEnabled] = useState(true);
  const [dragPos, setDragPos] = useState({ x: 50, y: 68 });
  const [baseImage, setBaseImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [activePanel, setActivePanel] = useState('mode'); // 'mode' | 'type' | 'color'
  const [exportMsg, setExportMsg] = useState('');

  const [animationType, setAnimationType] = useState('orbit');
  const [animationSpeed, setAnimationSpeed] = useState(1.0);

  const animTypeRef = useRef('orbit');
  const animSpeedRef = useRef(1.0);

  useEffect(() => {
    animTypeRef.current = animationType;
  }, [animationType]);

  useEffect(() => {
    animSpeedRef.current = animationSpeed;
  }, [animationSpeed]);

  // Build Three.js scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = 1200, H = 675;
    const renderer = new THREE.WebGLRenderer({ canvas, preserveDrawingBuffer: true, antialias: true });
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(palette[0], 1);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(palette[0]);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Background plane
    const geo = new THREE.PlaneGeometry(8, 4.5, 40, 40);
    const mat = new THREE.MeshStandardMaterial({ color: palette[1], metalness: 0.3, roughness: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -0.15;
    mesh.position.z = -1.5;
    scene.add(mesh);
    meshRef.current = mesh;

    // Lights
    const dir = new THREE.DirectionalLight(palette[2], 1.8);
    dir.position.set(4, 5, 5);
    scene.add(dir);
    const amb = new THREE.AmbientLight(0x1a1a2e, 0.6);
    scene.add(amb);

    // Particle field
    const pts = 600;
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(pts * 3);
    for (let i = 0; i < pts; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.06, color: palette[2], transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
    scene.add(new THREE.Points(pGeo, pMat));

    const clock = new THREE.Clock();
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime() * animSpeedRef.current;
      const type = animTypeRef.current;

      if (type !== 'none') {
        if (type === 'orbit') {
          if (meshRef.current) meshRef.current.rotation.z = Math.sin(t * 0.3) * 0.04;
          // Rotate particles slightly
          const ptsObj = scene.getObjectByProperty('type', 'Points');
          if (ptsObj) ptsObj.rotation.y = t * 0.02;
        } else if (type === 'pulse') {
          const scale = 1.0 + Math.sin(t * 1.5) * 0.03;
          if (meshRef.current) meshRef.current.scale.set(scale, scale, scale);
        } else if (type === 'warp') {
          // Move particles along Z axis towards camera, then reset
          const ptsObj = scene.getObjectByProperty('type', 'Points');
          if (ptsObj) {
            ptsObj.rotation.y = t * 0.05;
            const positions = ptsObj.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
              positions[i + 2] += 0.05 * animSpeedRef.current;
              if (positions[i + 2] > 2) {
                positions[i + 2] = -5; // reset far away
              }
            }
            ptsObj.geometry.attributes.position.needsUpdate = true;
          }
        } else if (type === 'flow') {
          if (meshRef.current) {
            meshRef.current.rotation.x = -0.15 + Math.sin(t * 0.5) * 0.05;
            meshRef.current.rotation.y = Math.cos(t * 0.5) * 0.05;
          }
        }
      } else {
        // Reset transformations if none
        if (meshRef.current) {
          meshRef.current.rotation.set(-0.15, 0, 0);
          meshRef.current.scale.set(1, 1, 1);
        }
        const ptsObj = scene.getObjectByProperty('type', 'Points');
        if (ptsObj) ptsObj.rotation.set(0, 0, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
    };
  }, [palette]);

  // Apply base image texture
  useEffect(() => {
    if (!baseImage || !sceneRef.current) return;
    new THREE.TextureLoader().load(baseImage, (tex) => {
      const existing = sceneRef.current.getObjectByName('cover');
      if (existing) sceneRef.current.remove(existing);
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 4.5),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.92 })
      );
      m.name = 'cover';
      sceneRef.current.add(m);
    });
  }, [baseImage]);

  // Update scene colors when mode changes
  const updatePalette = useCallback((newPalette) => {
    if (!sceneRef.current || !rendererRef.current) return;
    sceneRef.current.background = new THREE.Color(newPalette[0]);
    rendererRef.current.setClearColor(newPalette[0], 1);
    if (meshRef.current) meshRef.current.material.color.set(newPalette[1]);
  }, []);

  const handleModeChange = (m) => {
    setMode(m);
    const p = getModePalette(m);
    setPalette(p);
    setTypography(TYPOGRAPHY_PRESETS[m] || TYPOGRAPHY_PRESETS.cinematic);
    updatePalette(p);
  };

  // Drag handlers for headline positioning
  const onPointerDown = () => { dragRef.current = true; };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDragPos({
      x: Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100)),
    });
  };
  const onPointerUp = () => { dragRef.current = false; };

  const generateBaseImage = async () => {
    setGenerating(true);
    try {
      const prompt = buildModePrompt(mode, headline, overlay);
      const res = await fetch('/api/ai/thumbnails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size: '1024x1024' }),
      });
      const json = await res.json();
      if (json?.image) setBaseImage(json.image);
      else if (json?.raw?.data?.[0]?.url) setBaseImage(json.raw.data[0].url);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const exportCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas matching the high-res 1200x675 size
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1200;
    tempCanvas.height = 675;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    // Draw the current WebGL frame onto the temp canvas
    ctx.drawImage(canvas, 0, 0, 1200, 675);

    // Setup typography context
    ctx.save();
    
    const fontName = typography?.font?.split(',')[0]?.trim() || 'Inter';
    const fontSize = typography?.size || 64;
    const fontWeight = typography?.weight || 800;
    const textStyle = typography?.style || 'uppercase';
    const isUppercase = textStyle === 'uppercase';
    const isCapitalize = textStyle === 'capitalize';
    
    // Apply drop shadow if enabled
    if (shadowEnabled) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8;
    }

    // Format text case
    let formattedText = headline;
    if (isUppercase) formattedText = headline.toUpperCase();
    else if (isCapitalize) {
      formattedText = headline.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }

    ctx.fillStyle = textColor;
    ctx.font = `${fontWeight} ${fontSize}px "${fontName}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate coordinates (dragPos is in percentages)
    const textX = (dragPos.x / 100) * 1200;
    const textY = (dragPos.y / 100) * 675;

    // Handle multiline wrapping for long text
    const maxTextWidth = 1000;
    const words = formattedText.split(' ');
    let line = '';
    const lines = [];
    const lineHeight = fontSize * 1.15;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxTextWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Draw text lines centered on target Y
    const totalHeight = (lines.length - 1) * lineHeight;
    let currentY = textY - totalHeight / 2;
    
    lines.forEach((l) => {
      ctx.fillText(l, textX, currentY);
      currentY += lineHeight;
    });

    ctx.restore();

    // Draw overlay subtitle text at the bottom
    if (overlay) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = `600 18px 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      ctx.fillText(overlay.toUpperCase(), 600, 640);
      ctx.restore();
    }

    // Draw custom brand/mode badge at bottom left
    ctx.save();
    ctx.fillStyle = `${palette[0]}cc`;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    const badgeText = currentMode?.name || 'CINEMATIC';
    ctx.font = `900 12px 'Inter', sans-serif`;
    const textWidth = ctx.measureText(badgeText).width;
    const badgeW = textWidth + 24;
    const badgeH = 26;
    const badgeX = 40;
    const badgeY = 610;

    // Draw badge background
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 13);
    } else {
      ctx.rect(badgeX, badgeY, badgeW, badgeH);
    }
    ctx.fill();
    ctx.stroke();

    // Draw badge text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText.toUpperCase(), badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);
    ctx.restore();

    // Download the merged image
    const data = tempCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = data;
    a.download = `streamflare-poster-${mode}-${Date.now()}.png`;
    a.click();
    setExportMsg('Downloaded!');
    setTimeout(() => setExportMsg(''), 2500);
  };

  const applyToDashboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas matching the high-res 1200x675 size
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1200;
    tempCanvas.height = 675;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    // Draw the current WebGL frame onto the temp canvas
    ctx.drawImage(canvas, 0, 0, 1200, 675);

    // Setup typography context
    ctx.save();
    
    const fontName = typography?.font?.split(',')[0]?.trim() || 'Inter';
    const fontSize = typography?.size || 64;
    const fontWeight = typography?.weight || 800;
    const textStyle = typography?.style || 'uppercase';
    const isUppercase = textStyle === 'uppercase';
    const isCapitalize = textStyle === 'capitalize';
    
    // Apply drop shadow if enabled
    if (shadowEnabled) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8;
    }

    // Format text case
    let formattedText = headline;
    if (isUppercase) formattedText = headline.toUpperCase();
    else if (isCapitalize) {
      formattedText = headline.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }

    ctx.fillStyle = textColor;
    ctx.font = `${fontWeight} ${fontSize}px "${fontName}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate coordinates (dragPos is in percentages)
    const textX = (dragPos.x / 100) * 1200;
    const textY = (dragPos.y / 100) * 675;

    // Handle multiline wrapping for long text
    const maxTextWidth = 1000;
    const words = formattedText.split(' ');
    let line = '';
    const lines = [];
    const lineHeight = fontSize * 1.15;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxTextWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Draw text lines centered on target Y
    const totalHeight = (lines.length - 1) * lineHeight;
    let currentY = textY - totalHeight / 2;
    
    lines.forEach((l) => {
      ctx.fillText(l, textX, currentY);
      currentY += lineHeight;
    });

    ctx.restore();

    // Draw overlay subtitle text at the bottom
    if (overlay) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = `600 18px 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      ctx.fillText(overlay.toUpperCase(), 600, 640);
      ctx.restore();
    }

    // Draw custom brand/mode badge at bottom left
    ctx.save();
    ctx.fillStyle = `${palette[0]}cc`;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    const badgeText = currentMode?.name || 'CINEMATIC';
    ctx.font = `900 12px 'Inter', sans-serif`;
    const textWidth = ctx.measureText(badgeText).width;
    const badgeW = textWidth + 24;
    const badgeH = 26;
    const badgeX = 40;
    const badgeY = 610;

    // Draw badge background
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 13);
    } else {
      ctx.rect(badgeX, badgeY, badgeW, badgeH);
    }
    ctx.fill();
    ctx.stroke();

    // Draw badge text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText.toUpperCase(), badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);
    ctx.restore();

    const data = tempCanvas.toDataURL('image/png');
    setCustomBanner(data);
    setExportMsg('Applied to Dashboard!');
    setTimeout(() => setExportMsg(''), 2500);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(buildModePrompt(mode, headline, overlay));
    setExportMsg('Prompt copied!');
    setTimeout(() => setExportMsg(''), 2000);
  };

  const currentMode = THUMBNAIL_MODES.find(m => m.id === mode);

  return (
    <div className="space-y-6">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-2xl border border-white/10 bg-black/30 p-1 gap-1">
          {[
            { id: 'mode', icon: Layers, label: 'Mode' },
            { id: 'type', icon: Type, label: 'Typography' },
            { id: 'color', icon: Palette, label: 'Color' },
            { id: 'animation', icon: Activity, label: 'Animation' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActivePanel(id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${activePanel === id ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30' : 'text-slate-400 hover:text-white'}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <select
          value={ratio.id}
          onChange={(e) => setRatio(ASPECT_RATIOS.find(r => r.id === e.target.value))}
          className="rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-white outline-none"
        >
          {ASPECT_RATIOS.map(r => <option key={r.id} value={r.id}>{r.id}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          {exportMsg && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-emerald-400 font-bold">
              ✓ {exportMsg}
            </motion.span>
          )}
          <button onClick={copyPrompt} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:text-white transition">
            <Copy className="h-3.5 w-3.5" /> Copy Prompt
          </button>
          <button onClick={generateBaseImage} disabled={generating} className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition disabled:opacity-60">
            {generating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            {generating ? 'Generating…' : 'AI Generate'}
          </button>
          <button onClick={applyToDashboard} className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition">
            <Check className="h-3.5 w-3.5" /> Apply as Banner
          </button>
          <button onClick={exportCanvas} className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition">
            <Download className="h-3.5 w-3.5" /> Download Poster
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        {/* Left control panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {activePanel === 'mode' && (
              <motion.div key="mode" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Poster Style</p>
                <div className="grid grid-cols-2 gap-2">
                  {THUMBNAIL_MODES.map((m) => {
                    const p = getModePalette(m.id);
                    return (
                      <motion.button
                        key={m.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleModeChange(m.id)}
                        className={`relative overflow-hidden rounded-2xl border p-3 text-left transition ${mode === m.id ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                      >
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{ background: `linear-gradient(135deg, ${p[0]}, ${p[1]}, ${p[2]})` }}
                        />
                        <p className="relative text-xs font-black text-white truncate">{m.name}</p>
                        <p className="relative mt-0.5 text-[9px] text-slate-400 line-clamp-2">{m.description}</p>
                        {mode === m.id && (
                          <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-400" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activePanel === 'type' && (
              <motion.div key="type" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Typography</p>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Headline Text</label>
                  <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                    placeholder="Your poster headline"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subtitle / Overlay</label>
                  <input
                    value={overlay}
                    onChange={(e) => setOverlay(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Font Family</label>
                  <select
                    value={typography?.font?.split(',')[0]?.trim() || 'Inter'}
                    onChange={(e) => setTypography(prev => ({ ...prev, font: `${e.target.value}, system-ui, sans-serif` }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                  >
                    {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Size: {typography?.size || 64}px</label>
                    <input type="range" min="28" max="120" value={typography?.size || 64}
                      onChange={(e) => setTypography(prev => ({ ...prev, size: Number(e.target.value) }))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weight</label>
                    <select value={typography?.weight || 700}
                      onChange={(e) => setTypography(prev => ({ ...prev, weight: Number(e.target.value) }))}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-2 py-1.5 text-xs text-white outline-none"
                    >
                      {[400, 600, 700, 800, 900].map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tracking: {(typography?.tracking || 0).toFixed(3)}em</label>
                  <input type="range" min="-0.05" max="0.15" step="0.005" value={typography?.tracking || 0}
                    onChange={(e) => setTypography(prev => ({ ...prev, tracking: Number(e.target.value) }))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Text Transform</span>
                  <select value={typography?.style || 'uppercase'}
                    onChange={(e) => setTypography(prev => ({ ...prev, style: e.target.value }))}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 px-2 py-1 text-xs text-white outline-none"
                  >
                    <option value="uppercase">Uppercase</option>
                    <option value="capitalize">Capitalize</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Drop Shadow</span>
                  <button
                    onClick={() => setShadowEnabled(v => !v)}
                    className={`relative h-6 w-11 rounded-full transition ${shadowEnabled ? 'bg-cyan-400' : 'bg-slate-700'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${shadowEnabled ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </motion.div>
            )}

            {activePanel === 'color' && (
              <motion.div key="color" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Color Studio</p>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Text Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                      className="h-10 w-16 cursor-pointer rounded-xl border border-white/10 bg-transparent p-0.5"
                    />
                    <span className="font-mono text-xs text-slate-300">{textColor.toUpperCase()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Palette</label>
                  <div className="flex gap-2">
                    {palette.map((c, i) => (
                      <div key={i} className="h-12 flex-1 rounded-2xl border border-white/10 shadow-inner" style={{ background: c }}>
                        <div className="flex h-full items-end p-1">
                          <span className="text-[7px] font-mono text-white/60">{c}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quick Themes</label>
                  <div className="grid grid-cols-3 gap-2">
                    {THUMBNAIL_MODES.slice(0, 9).map(m => {
                      const p = getModePalette(m.id);
                      return (
                        <button key={m.id} onClick={() => { setPalette(p); updatePalette(p); }}
                          className="h-10 rounded-xl border border-white/10 transition hover:scale-105 hover:border-white/30"
                          style={{ background: `linear-gradient(135deg, ${p[0]}, ${p[1]})` }}
                          title={m.name}
                        />
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activePanel === 'animation' && (
              <motion.div key="animation" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Animation Style</p>
                  <div className="space-y-2">
                    {[
                      { id: 'orbit', name: 'Cosmic Orbit', desc: 'Slow elegant rotation of particles and mesh.' },
                      { id: 'pulse', name: 'Ethereal Pulse', desc: 'Rhythmic scaling/breathing motion.' },
                      { id: 'warp', name: 'Warp Speed', desc: 'Accelerated particle stream moving forward.' },
                      { id: 'flow', name: 'Fluid Flow', desc: 'Multidirectional sweeping wave rotation.' },
                      { id: 'none', name: 'Static Mode', desc: 'Freeze all rendering animations.' },
                    ].map((anim) => (
                      <button
                        key={anim.id}
                        onClick={() => setAnimationType(anim.id)}
                        className={`w-full flex flex-col items-start gap-0.5 rounded-2xl border p-3 text-left transition ${
                          animationType === anim.id
                            ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300 shadow-[0_4px_20px_rgba(34,211,238,0.1)]'
                            : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-wider">{anim.name}</span>
                        <span className="text-[10px] opacity-80 font-medium">{anim.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Animation Speed</label>
                    <span className="text-[10px] font-mono font-bold text-cyan-300">{animationSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Interactive canvas preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Live Preview — {currentMode?.name} · {ratio.id} · {ratio.w}×{ratio.h}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Drag headline to reposition</span>
          </div>

          <motion.div
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-[0_20px_60px_rgba(0,0,0,0.6)] cursor-crosshair"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(34,211,238,0.15)' }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <canvas ref={canvasRef} className="w-full h-auto block" />

            {/* Draggable headline overlay */}
            <div
              className="absolute select-none"
              style={{ left: `${dragPos.x}%`, top: `${dragPos.y}%`, transform: 'translate(-50%, -50%)' }}
              onPointerDown={onPointerDown}
            >
              <motion.h2
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="cursor-grab active:cursor-grabbing drop-shadow-2xl"
                style={{
                  color: textColor,
                  fontFamily: typography?.font,
                  fontSize: typography?.size ? `${typography.size}px` : '64px',
                  fontWeight: typography?.weight || 800,
                  letterSpacing: typography?.tracking ? `${typography.tracking}em` : undefined,
                  textTransform: typography?.style === 'uppercase' ? 'uppercase' : typography?.style === 'capitalize' ? 'capitalize' : 'none',
                  textShadow: shadowEnabled ? (typography?.shadow || '0 8px 30px rgba(0,0,0,0.8)') : 'none',
                  lineHeight: 1.1,
                  maxWidth: '80%',
                  textAlign: 'center',
                  userSelect: 'none',
                }}
              >
                {headline}
              </motion.h2>
            </div>

            {/* Mode badge */}
            <div className="absolute left-4 bottom-4 flex items-center gap-2">
              <div
                className="rounded-full border border-white/20 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md"
                style={{ background: `${palette[0]}cc` }}
              >
                {currentMode?.name}
              </div>
              {baseImage && (
                <div className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-1 text-[9px] font-bold text-emerald-300">
                  ⚡ AI Image Applied
                </div>
              )}
            </div>
          </motion.div>

          {/* Prompt preview */}
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Generated Prompt Preview</p>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{buildModePrompt(mode, headline, overlay)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
