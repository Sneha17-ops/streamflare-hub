import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/movies(.*)",
  "/music(.*)",
  "/games(.*)",
  "/dashboard(.*)",
  "/api/movies(.*)",
  "/api/songs(.*)",
  "/api/games(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|sign-in|sign-up|[^?]*\\.(?:html|css|js|gif|svg|png|jpg|jpeg|webp|mp3|mp4|xml|txt)).*)",
    "/(api|trpc)(.*)",
  ],
};
