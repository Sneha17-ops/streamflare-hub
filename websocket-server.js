const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all connections
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const roomPresence = new Map();

// Health Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "StreamFlare WebSocket Engine" });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 REAL-TIME WEBSOCKET BROKER CHANNELS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

io.on("connection", (socket) => {
  console.log(`🔌 Client connected to Socket.IO broker: ${socket.id}`);

  const broadcastPresence = (roomId) => {
    const members = Array.from(roomPresence.get(roomId) || []);
    io.to(roomId).emit("room-presence", { roomId, members, count: members.length });
  };

  // 1. Music Sync Lounges
  socket.on("join-music-room", (roomId) => {
    socket.join(roomId);
    console.log(`🎵 Socket ${socket.id} joined music channel: ${roomId}`);
  });

  socket.on("music-action", (data) => {
    // data: { roomId, isPlaying, time, trackId }
    socket.to(data.roomId).emit("music-sync", data);
  });

  socket.on("join-room", ({ roomId, user }) => {
    socket.join(roomId);
    const members = roomPresence.get(roomId) || new Map();
    members.set(socket.id, { id: socket.id, name: user?.name || "Guest", avatar: user?.avatar || null, status: "Online" });
    roomPresence.set(roomId, members);
    broadcastPresence(roomId);
  });

  socket.on("room-message", (payload) => {
    socket.to(payload.roomId).emit("room-message", payload);
  });

  socket.on("room-reaction", (payload) => {
    socket.to(payload.roomId).emit("room-reaction", payload);
  });

  socket.on("watch-party-sync", (payload) => {
    socket.to(payload.roomId).emit("watch-party-sync", payload);
  });

  socket.on("presence-ping", ({ roomId, status = "Listening" }) => {
    const members = roomPresence.get(roomId);
    if (!members) return;
    const member = members.get(socket.id);
    if (member) {
      member.status = status;
      members.set(socket.id, member);
      roomPresence.set(roomId, members);
      broadcastPresence(roomId);
    }
  });

  // 2. Multiplayer Gaming Rooms
  socket.on("join-game-lobby", (lobbyId) => {
    socket.join(lobbyId);
    console.log(`🎮 Socket ${socket.id} entered multiplayer lobby: ${lobbyId}`);
  });

  socket.on("game-move", (data) => {
    // Broadcast real-time controls to other room players
    socket.to(data.lobbyId).emit("game-state-sync", data);
  });

  // Disconnection handler
  socket.on("disconnect", () => {
    roomPresence.forEach((members, roomId) => {
      if (members.delete(socket.id)) {
        roomPresence.set(roomId, members);
        broadcastPresence(roomId);
      }
    });
    console.log(`🔌 Client disconnected from Socket.IO: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 StreamFlare WebSocket broker live on port ${PORT}`);
});
