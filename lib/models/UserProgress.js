import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, default: "StreamFlare User" },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    achievements: { type: [AchievementSchema], default: [] },
    streak: { type: Number, default: 0 },
    rank: { type: String, default: "Bronze" },
    favoriteMood: { type: String, default: "Chill" },
    favorites: { type: [mongoose.Schema.Types.Mixed], default: [] },
    watchlist: { type: [mongoose.Schema.Types.Mixed], default: [] },
    recentlyPlayed: { type: [mongoose.Schema.Types.Mixed], default: [] },
    stats: {
      watchHours: { type: Number, default: 0 },
      playHours: { type: Number, default: 0 },
      roomSessions: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.UserProgress || mongoose.model("UserProgress", UserProgressSchema);
