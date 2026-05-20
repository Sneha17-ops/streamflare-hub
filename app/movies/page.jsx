"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Film, Search, SlidersHorizontal } from "lucide-react";
import { fetchTrendingMovies } from "@/lib/api";
import MovieCard from "@/components/MovieCard";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const genres = ["All", "Action", "Drama", "Sci-Fi", "Comedy", "Thriller"];

  useEffect(() => {
    async function loadMovies() {
      const data = await fetchTrendingMovies();
      setMovies(data);
      setFilteredMovies(data);
    }
    loadMovies();
  }, []);

  useEffect(() => {
    let result = movies;

    if (selectedGenre !== "All") {
      result = result.filter((m) => m.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q)
      );
    }

    setFilteredMovies(result);
  }, [searchQuery, selectedGenre, movies]);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const cardVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } } };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-900 pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white font-mono uppercase flex items-center space-x-3">
            <Film className="w-8 h-8 text-purple-500" />
            <span>Stream Cinema</span>
          </h1>
          <p className="text-xs text-slate-400">Browse and stream premium films with dual-mode metadata caching.</p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 outline-none transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide select-none">
        <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-400">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border smooth-transition whitespace-nowrap ${
              selectedGenre === genre
                ? "bg-purple-600 border-purple-500 text-white shadow-neon-purple"
                : "bg-slate-900/30 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {filteredMovies.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <motion.div key={movie.id} variants={cardVariants}>
              <MovieCard movie={movie} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-500">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wide">No Films Located</h3>
          <p className="text-xs text-slate-500 max-w-xs">Refine your query parameters or reset categories to browse our cinema collections.</p>
        </div>
      )}
    </div>
  );
}
