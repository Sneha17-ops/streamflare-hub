import { NextResponse } from "next/server";
import { createRoomSnapshot, generateRoomCode } from "@/lib/streamflare-ai";

export async function GET() {
  const rooms = ["CINE-CLUB", "TRAILER-HIVE", "NEON-ROOM"].map((roomId, index) => {
    const room = createRoomSnapshot(roomId);
    return {
      id: room.id,
      title: index === 0 ? "Prime Watch Party" : room.title,
      description: room.description,
      inviteCode: room.id,
      participants: room.participants.length,
      nowPlaying: room.playback,
      roomType: index === 2 ? "movie" : "watch-party",
    };
  });

  return NextResponse.json(rooms);
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const roomId = (body.roomId || generateRoomCode("PARTY")).toUpperCase();

  return NextResponse.json(
    {
      id: roomId,
      title: body.title || "Watch Party",
      description: body.description || "Synchronized viewing space with live chat and reactions.",
      inviteCode: roomId,
      roomType: "watch-party",
      nowPlaying: body.nowPlaying || null,
    },
    { status: 201 }
  );
}
