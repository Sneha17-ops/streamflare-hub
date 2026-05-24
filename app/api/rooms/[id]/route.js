import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/redis";
import { dbConnect } from "@/lib/mongodb";
import Room from "@/lib/models/Room";
import { createRoomSnapshot } from "@/lib/streamflare-ai";

export async function GET(_request, { params }) {
  const roomId = params.id;
  const cacheKey = `rooms:${roomId}`;

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
  } catch (error) {
    // Cache is optional.
  }

  try {
    await dbConnect();
    const room = await Room.findOne({ roomId }).lean();
    if (room) {
      const payload = {
        id: room.roomId,
        title: room.title,
        description: room.description,
        type: room.type,
        inviteCode: room.inviteCode,
        participants: room.participants || [],
        messages: room.messages || [],
        queue: room.queue || [],
        nowPlaying: room.nowPlaying || null,
        hostId: room.hostId,
      };
      await setCache(cacheKey, payload, 120);
      return NextResponse.json(payload);
    }
  } catch (error) {
    // DB fallback continues below.
  }

  const snapshot = createRoomSnapshot(roomId);
  const payload = {
    id: snapshot.id,
    title: snapshot.title,
    description: snapshot.description,
    type: "music",
    inviteCode: snapshot.id,
    participants: snapshot.participants,
    messages: snapshot.messages,
    queue: [],
    nowPlaying: snapshot.playback,
    hostId: `${snapshot.id}-host`,
  };

  await setCache(cacheKey, payload, 120).catch(() => {});
  return NextResponse.json(payload);
}
