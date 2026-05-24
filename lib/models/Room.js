import mongoose from "mongoose";

const RoomParticipantSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: "Guest" },
    avatar: { type: String, default: "" },
    status: { type: String, default: "Listening" },
  },
  { _id: false }
);

const RoomMessageSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: String, default: "00:00" },
    emoji: { type: String, default: "✨" },
  },
  { _id: false }
);

const RoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["music", "watch-party", "mixed"], default: "music" },
    hostId: { type: String, required: true },
    queue: { type: [mongoose.Schema.Types.Mixed], default: [] },
    participants: { type: [RoomParticipantSchema], default: [] },
    messages: { type: [RoomMessageSchema], default: [] },
    nowPlaying: { type: mongoose.Schema.Types.Mixed, default: null },
    inviteCode: { type: String, default: "" },
    isPublic: { type: Boolean, default: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);
