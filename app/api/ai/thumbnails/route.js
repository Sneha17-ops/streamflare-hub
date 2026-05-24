import { NextResponse } from "next/server";
console.log("/api/ai/thumbnails route module loaded");
import { createHash } from "node:crypto";
import { getCache, setCache } from "@/lib/redis";
import { generateThumbnailConcept } from "@/lib/streamflare-ai";

function readJsonValue(payload, key, fallback = "") {
  const value = payload?.[key];
  return typeof value === "string" ? value.trim() : fallback;
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch (error) {
    body = {};
  }

  const title = readJsonValue(body, "title", "Untitled Feature");
  const type = readJsonValue(body, "type", "cinematic poster");
  const mood = readJsonValue(body, "mood", "premium");
  const overlay = readJsonValue(body, "overlay", "");
  const style = readJsonValue(body, "style", "glassmorphism");
  const cacheKey = `ai:thumbnail:${createHash("sha1").update(JSON.stringify({ title, type, mood, overlay, style })).digest("hex")}`;
  console.log("/api/ai/thumbnails incoming", { title, type, mood, overlay, style, cacheKey });

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
  } catch (error) {
    // Cache is optional.
  }

  try {
    console.log("/api/ai/thumbnails calling generateThumbnailConcept");
    const concept = await generateThumbnailConcept({ title, type, mood, overlay, style });
    console.log("/api/ai/thumbnails generateThumbnailConcept returned", { conceptHead: concept && concept.headline });
    const payload = {
      ...concept,
      title,
      type,
      mood,
      overlay,
      style,
      generatedAt: new Date().toISOString(),
    };

    try {
      await setCache(cacheKey, payload, 900);
    } catch (error) {
      // Cache is optional.
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("/api/ai/thumbnails error:", error);
    return NextResponse.json({ error: "Internal server error", detail: String(error) }, { status: 500 });
  }
}