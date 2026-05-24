import { NextResponse } from "next/server";

export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|sign-in|sign-up|[^?]*\\.(?:html|css|js|gif|svg|png|jpg|jpeg|webp|mp3|mp4|xml|txt)).*)",
    "/(api|trpc)(.*)",
  ],
};
