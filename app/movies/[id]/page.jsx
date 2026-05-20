"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, ArrowLeft, Heart, Plus, Check, Star, MessageSquare } from "lucide-react";
import { MOCK_MOVIES } from "@/lib/api";
import { useUserStore } from "@/store";
import BlurImage from "@/components/BlurImage";

export default function MovieDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([
    { author: "Marcus Vance", text: "Visually spectacular. The spatial audio track blew me away!", rating: 9, date: "2026-05-18" },
    { author: "Elena Rostova", text: "A breathtaking performance, absolutely a masterpiece. Must watch!", rating: 10, date: "2026-05-19" }
  ]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(10);

  const { watchlist, favorites, addToWatchlist, removeFromWatchlist, addFavorite, removeFavorite } = useUserStore();

  useEffect(() => {
    if (id) {
      const found = MOCK_MOVIES.find((m) => m.id === id);
      setMovie(found || MOCK_MOVIES[0]);
    }
  }, [id]);

  if (!movie) return null;

  const inWatchlist = watchlist.some((w) => w.id === movie.id);
  const inFavorites = favorites.some((f) => f.id === movie.id);

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist({ id: movie.id, title: movie.title, cover: movie.poster_path });
    }
  };

  const handleFavoriteToggle = () => {
    if (inFavorites) {
      removeFavorite(movie.id);
    } else {
      addFavorite({ id: movie.id, type: "movie", title: movie.title, cover: movie.poster_path });
    }
  };

  const handlePostReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    setReviews([
      {
        author: "You (Verified User)",
        text: newReviewText,
        rating: newReviewRating,
        date: new Date().toISOString().split("T")[0]
      },
      ...reviews
    ]);
    setNewReviewText("");
  };

  return (
    <div className="space-y-12">
      <button onClick={() => router.back()} className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white smooth-transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Catalog</span>
      </button>

      <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden border border-slate-800 bg-black shadow-neon-purple select-none">
        <video src={movie.videoUrl} controls autoPlay className="w-full h-full object-cover" poster={movie.backdrop_path} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black font-mono tracking-wide text-white uppercase">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
              <span className="text-cyan-400 font-bold bg-cyan-950/50 border border-cyan-900/30 px-2 py-0.5 rounded">★ {movie.vote_average.toFixed(1)}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">{movie.genre}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{movie.runtime}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Release: {movie.release_date}</span>
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed font-sans border-t border-slate-900 pt-6">{movie.description}</p>

          <div className="flex items-center space-x-4 border-t border-slate-900 pt-6 select-none">
            <button onClick={handleFavoriteToggle} className={`flex items-center space-x-2 px-6 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest smooth-transition ${inFavorites ? "bg-rose-950/40 border-rose-500 text-rose-300 shadow-neon-accent" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"}`}>
              <Heart className={`w-4 h-4 ${inFavorites ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{inFavorites ? "Liked" : "Like Movie"}</span>
            </button>
            <button onClick={handleWatchlistToggle} className={`flex items-center space-x-2 px-6 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest smooth-transition ${inWatchlist ? "bg-emerald-950/40 border-emerald-500 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"}`}>
              {inWatchlist ? (<><Check className="w-4 h-4" /><span>On Watchlist</span></>) : (<><Plus className="w-4 h-4" /><span>Add Watchlist</span></>)}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-2.5 text-sm font-bold uppercase tracking-widest text-slate-300 font-mono">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Critic Reviews</span>
          </div>

          <form onSubmit={handlePostReview} className="space-y-3 glass-panel p-4 rounded-2xl border border-slate-800">
            <textarea rows={2} value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} placeholder="Post a review comment..." className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-purple-500 outline-none resize-none smooth-transition" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-mono text-slate-500">Rating:</span>
                <select value={newReviewRating} onChange={(e) => setNewReviewRating(parseInt(e.target.value))} className="bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-cyan-400 p-0.5 outline-none">
                  {[10, 9, 8, 7, 6, 5].map((r) => (<option key={r} value={r}>{r}/10</option>))}
                </select>
              </div>
              <button type="submit" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-[10px] font-bold uppercase tracking-widest text-white rounded-lg smooth-transition">Submit</button>
            </div>
          </form>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {reviews.map((r, i) => (
              <div key={i} className="glass-panel p-4 rounded-2xl border border-slate-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 font-mono">{r.author}</span>
                  <div className="flex items-center space-x-1 text-[9px] font-mono text-cyan-400"><Star className="w-3 h-3 fill-cyan-400 text-cyan-400" /><span>{r.rating}/10</span></div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{r.text}</p>
                <div className="text-[9px] font-mono text-slate-600 text-right">{r.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
