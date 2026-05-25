"use client";
export const dynamic = 'force-dynamic';


import React, { useEffect, useMemo, useState } from "react";
import { Copy, Loader2, Wand2, Sparkles, ImagePlus, Type, Palette, LayoutGrid } from "lucide-react";
import { getMoodOptions } from "@/lib/streamflare-ai";
import { GlassPanel, GlowButton, SectionHeader } from "@/components/ImmersiveKit";
import AuthGate from "@/components/AuthGate";
import ThumbnailEditor from "@/components/ThumbnailEditor";

const DEFAULT_FORM = {
  title: "Midnight Aura",
  type: "Cinematic Poster",
  mood: "Chill",
  overlay: "AI-generated thumbnail concept",
  style: "glassmorphism",
};

export default function ThumbnailStudioPage() {
  const moods = useMemo(() => getMoodOptions(), []);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [concept, setConcept] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  useEffect(() => {
    void generateConcept(DEFAULT_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateConcept(nextForm) {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/thumbnails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextForm),
      });
      const data = await response.json();
      setConcept(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await generateConcept(form);
  }

  async function handleCopy() {
    if (!concept?.prompt) return;
    await navigator.clipboard.writeText(concept.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function handleGenerateImage() {
    if (!concept?.prompt) return;
    setGeneratingImage(true);
    try {
      const res = await fetch("/api/ai/thumbnails/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: concept.prompt, 
          size: "1024x1024", 
          palette: concept.palette || ["#0f172a", "#06b6d4", "#ec4899"] 
        }),
      });
      const data = await res.json();
      if (data?.image) setImageData(data.image);
    } finally {
      setGeneratingImage(false);
    }
  }

  const palette = concept?.palette || ["#0f172a", "#06b6d4", "#ec4899"];

  return (
    <AuthGate>
      <div className="space-y-8 pb-12">
        <SectionHeader
          kicker="AI Thumbnail Generator"
          title="Build cinematic cover art concepts in seconds."
          subtitle="Generate thumbnail briefs, prompt lines, and visual direction for movies, music, games, or social promos."
          actionHref="/dashboard"
          actionLabel="Back to dashboard"
        />

        <GlassPanel className="p-6">
          <ThumbnailEditor initial={{ title: 'Midnight Aura', overlay: 'AI-generated thumbnail concept', palette }} />
        </GlassPanel>
      </div>
    </AuthGate>
  );
}