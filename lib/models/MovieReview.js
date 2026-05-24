import mongoose from "mongoose";

const MovieReviewSchema = new mongoose.Schema(
  {
    movieId: { type: String, required: true, index: true },
    userId: { type: String, default: "" },
    author: { type: String, required: true },
    text: { type: String, required: true },
    rating: { type: Number, default: 10 },
    date: { type: String, default: () => new Date().toISOString().split("T")[0] },
  },
  { timestamps: true }
);

MovieReviewSchema.index({ movieId: 1, createdAt: -1 });

export default mongoose.models.MovieReview || mongoose.model("MovieReview", MovieReviewSchema);
