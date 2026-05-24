import { NextResponse } from "next/server";
import { THUMBNAIL_TEMPLATES, buildThumbnailPrompt } from "@/lib/streamflare-ai";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Untitled Experience";
  const type = searchParams.get("type") || "poster";
  const mood = searchParams.get("mood") || "cinematic";

  return NextResponse.json({
    templates: THUMBNAIL_TEMPLATES,
    prompt: buildThumbnailPrompt(title, type, mood),
    title,
    type,
    mood,
  });
}
