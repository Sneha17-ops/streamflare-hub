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

// Health Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "StreamFlare WebSocket Engine" });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 REAL-TIME WEBSOCKET BROKER CHANNELS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

io.on("connection", (socket) => {
  console.log(`🔌 Client connected to Socket.IO broker: ${socket.id}`);

  // 1. Music Sync Lounges
  socket.on("join-music-room", (roomId) => {
    socket.join(roomId);
    console.log(`🎵 Socket ${socket.id} joined music channel: ${roomId}`);
  });

  socket.on("music-action", (data) => {
    // data: { roomId, isPlaying, time, trackId }
    socket.to(data.roomId).emit("music-sync", data);
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
    console.log(`🔌 Client disconnected from Socket.IO: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 StreamFlare WebSocket broker live on port ${PORT}`);
});
