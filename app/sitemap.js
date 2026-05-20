import { MOCK_MOVIES } from "../lib/api";

export default function sitemap() {
  const baseUrl = "https://streamflare.io";

  const staticRoutes = ["", "/movies", "/music", "/games", "/dashboard"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8
  }));

  const dynamicMovieRoutes = MOCK_MOVIES.map((movie) => ({
    url: `${baseUrl}/movies/${movie.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.6
  }));

  return [...staticRoutes, ...dynamicMovieRoutes];
}
