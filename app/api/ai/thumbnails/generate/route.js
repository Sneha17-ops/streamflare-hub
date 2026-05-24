import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/redis";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";

function generateFallbackSvg(palette = ["#0f172a", "#06b6d4", "#ec4899"]) {
  const c1 = palette[0] || "#0f172a";
  const c2 = palette[1] || "#06b6d4";
  const c3 = palette[2] || "#ec4899";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="50%" stop-color="${c2}" />
        <stop offset="100%" stop-color="${c3}" />
      </linearGradient>
      <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${c2}" stop-opacity="0.6" />
        <stop offset="100%" stop-color="${c3}" stop-opacity="0" />
      </radialGradient>
      <filter id="blur">
        <feGaussianBlur stdDeviation="60" />
      </filter>
    </defs>
    
    <!-- Deep base background -->
    <rect width="1024" height="1024" fill="url(#bgGrad)" />
    
    <!-- Glowing nebulae -->
    <circle cx="200" cy="300" r="350" fill="${c2}" opacity="0.4" filter="url(#blur)" />
    <circle cx="800" cy="700" r="400" fill="${c3}" opacity="0.4" filter="url(#blur)" />
    <circle cx="512" cy="512" r="300" fill="url(#glowGrad)" filter="url(#blur)" />
    
    <!-- Futuristic Grid overlay -->
    <g stroke="white" stroke-opacity="0.05" stroke-width="1">
      <!-- Horizontal lines -->
      <line x1="0" y1="128" x2="1024" y2="128" />
      <line x1="0" y1="256" x2="1024" y2="256" />
      <line x1="0" y1="384" x2="1024" y2="384" />
      <line x1="0" y1="512" x2="1024" y2="512" />
      <line x1="0" y1="640" x2="1024" y2="640" />
      <line x1="0" y1="768" x2="1024" y2="768" />
      <line x1="0" y1="896" x2="1024" y2="896" />
      <!-- Vertical lines -->
      <line x1="128" y1="0" x2="128" y2="1024" />
      <line x1="256" y1="0" x2="256" y2="1024" />
      <line x1="384" y1="0" x2="384" y2="1024" />
      <line x1="512" y1="0" x2="512" y2="1024" />
      <line x1="640" y1="0" x2="640" y2="1024" />
      <line x1="768" y1="0" x2="768" y2="1024" />
      <line x1="896" y1="0" x2="896" y2="1024" />
    </g>
    
    <!-- Abstract geometric wave lines -->
    <path d="M 0,512 C 256,384 256,640 512,512 C 768,384 768,640 1024,512" fill="none" stroke="${c2}" stroke-width="4" opacity="0.3" />
    <path d="M 0,600 C 300,400 200,800 512,600 C 824,400 724,800 1024,600" fill="none" stroke="${c3}" stroke-width="2" opacity="0.2" />

    <!-- Center floating portal -->
    <circle cx="512" cy="512" r="180" fill="none" stroke="white" stroke-opacity="0.1" stroke-width="2" />
    <circle cx="512" cy="512" r="160" fill="none" stroke="${c2}" stroke-opacity="0.2" stroke-width="1" />
  </svg>`;
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  const prompt = (body.prompt || body.promptText || "Cinematic poster").toString();
  const size = (body.size || "1024x1024").toString();
  const palette = Array.isArray(body.palette) && body.palette.length ? body.palette : ["#0f172a", "#06b6d4", "#ec4899"];

  if (!OPENAI_API_KEY) {
    // Generate beautiful abstract SVG representation as standard fallback
    const svgStr = generateFallbackSvg(palette);
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgStr).toString("base64")}`;
    return NextResponse.json({
      prompt,
      size,
      image: dataUrl,
      source: "svg-fallback"
    });
  }

  const cacheKey = `ai:thumbnail:image:${Buffer.from(prompt + size).toString("base64")}`;
  try {
    const cached = await getCache(cacheKey);
    if (cached) return NextResponse.json(cached);
  } catch (e) {
    // ignore cache errors
  }

  try {
    const resp = await fetch(OPENAI_IMAGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || "dall-e-3",
        prompt,
        size,
        n: 1,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: "Image generation failed", detail: text }, { status: 502 });
    }

    const data = await resp.json();
    const item = data?.data?.[0] || {};
    let dataUrl = null;

    if (item.b64_json) {
      dataUrl = `data:image/png;base64,${item.b64_json}`;
    } else if (item.url) {
      try {
        const imgResp = await fetch(item.url);
        const arrayBuffer = await imgResp.arrayBuffer();
        const b64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = imgResp.headers.get("content-type") || "image/png";
        dataUrl = `data:${contentType};base64,${b64}`;
      } catch (e) {
        dataUrl = item.url;
      }
    }

    const payload = { prompt, size, image: dataUrl || null, raw: data, source: "openai" };

    try {
      await setCache(cacheKey, payload, 60 * 60);
    } catch (e) {
      // ignore cache errors
    }

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: "Image generation error", detail: String(error) }, { status: 500 });
  }
}
