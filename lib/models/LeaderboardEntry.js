import mongoose from "mongoose";

const LeaderboardEntrySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    badge: { type: String, default: "Rising Star" },
    city: { type: String, default: "Global" },
    xp: { type: Number, default: 0, index: true },
    tier: { type: String, default: "Bronze" },
    weekXp: { type: Number, default: 0 },
    monthXp: { type: Number, default: 0 },
    allTimeXp: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.LeaderboardEntry || mongoose.model("LeaderboardEntry", LeaderboardEntrySchema);
