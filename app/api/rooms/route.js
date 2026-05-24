import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCache, setCache, invalidateCache } from "@/lib/redis";
import { dbConnect } from "@/lib/mongodb";
import Room from "@/lib/models/Room";
import { createRoomSnapshot, generateRoomCode } from "@/lib/streamflare-ai";

async function fetchRoomsFromDatabase() {
  try {
    await dbConnect();
    const rooms = await Room.find().sort({ updatedAt: -1 }).limit(12).lean();
    if (rooms.length > 0) {
      return rooms.map((room) => ({
        id: room.roomId,
        title: room.title,
        description: room.description,
        participants: room.participants?.length || 0,
        queueCount: room.queue?.length || 0,
        type: room.type,
        inviteCode: room.inviteCode,
        nowPlaying: room.nowPlaying,
        updatedAt: room.updatedAt,
      }));
    }
  } catch (error) {
    // Database is optional for the first boot.
  }

  return [createRoomSnapshot("FLARE-LOUNGE"), createRoomSnapshot("NEON-SYNC"), createRoomSnapshot("CINEMA-ARC")].map((room) => ({
    id: room.id,
    title: room.title,
    description: room.description,
    participants: room.participants.length,
    queueCount: room.messages.length,
    type: "music",
    inviteCode: room.id,
    nowPlaying: room.playback,
    updatedAt: new Date().toISOString(),
  }));
}

export async function GET() {
  const cacheKey = "rooms:overview";

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
  } catch (error) {
    // Cache is optional.
  }

  const rooms = await fetchRoomsFromDatabase();

  try {
    await setCache(cacheKey, rooms, 120);
  } catch (error) {
    // Cache is optional.
  }

  return NextResponse.json(rooms);
}

export async function POST(request) {
  const { userId } = await auth();
  const body = await request.json().catch(() => ({}));
  const title = body.title || "StreamFlare Room";
  const type = body.type || "music";
  const roomId = (body.roomId || generateRoomCode("ROOM")).toUpperCase();

  try {
    await dbConnect();
    const room = await Room.create({
      roomId,
      title,
      description: body.description || "Immersive synchronized entertainment room.",
      type,
      hostId: userId || "guest-host",
      queue: body.queue || [],
      participants: body.participants || [],
      messages: body.messages || [],
      nowPlaying: body.nowPlaying || null,
      inviteCode: body.inviteCode || roomId,
      isPublic: body.isPublic ?? true,
      meta: body.meta || {},
    });

    await invalidateCache("rooms:overview").catch(() => {});
    return NextResponse.json({
      id: room.roomId,
      title: room.title,
      description: room.description,
      type: room.type,
      inviteCode: room.inviteCode,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      id: roomId,
      title,
      description: body.description || "Immersive synchronized entertainment room.",
      type,
      inviteCode: roomId,
      hostId: userId || "guest-host",
    }, { status: 201 });
  }
}
