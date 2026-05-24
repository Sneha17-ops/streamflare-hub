import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/mongodb";
import MovieReview from "@/lib/models/MovieReview";

const SEED_REVIEWS = [
  { author: "Marcus Vance", text: "Visually spectacular. The spatial audio track blew me away!", rating: 9, date: "2026-05-18" },
  { author: "Elena Rostova", text: "A breathtaking performance, absolutely a masterpiece. Must watch!", rating: 10, date: "2026-05-19" },
];

export async function GET(_request, { params }) {
  const movieId = params.id;
  try {
    await dbConnect();
    const reviews = await MovieReview.find({ movieId }).sort({ createdAt: -1 }).limit(20).lean();
    const payload = reviews.length > 0 ? reviews.map((review) => ({
      id: review._id.toString(),
      author: review.author,
      text: review.text,
      rating: review.rating,
      date: review.date,
    })) : SEED_REVIEWS;
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(SEED_REVIEWS);
  }
}

export async function POST(request, { params }) {
  const movieId = params.id;
  const body = await request.json().catch(() => ({}));

  try {
    const { userId } = await auth();
    await dbConnect();

    const author = body.author || (userId ? "Verified User" : "Guest Reviewer");
    const saved = await MovieReview.create({
      movieId,
      userId: userId || body.userId || "",
      author,
      text: body.text || "",
      rating: Number(body.rating || 10),
      date: new Date().toISOString().split("T")[0],
    });

    return NextResponse.json({
      id: saved._id.toString(),
      author: saved.author,
      text: saved.text,
      rating: saved.rating,
      date: saved.date,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      id: `${movieId}-${Date.now()}`,
      author: body.author || "Guest Reviewer",
      text: body.text || "",
      rating: Number(body.rating || 10),
      date: new Date().toISOString().split("T")[0],
    }, { status: 201 });
  }
}
