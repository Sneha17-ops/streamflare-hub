import React from "react";
import ClientShell from "../components/ClientShell";
import ConditionalMain from "../components/ConditionalMain";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

export const metadata = {
  title: "StreamFlare - Premium Space OTT, Audio, & Retro Gaming Console",
  description:
    "Reinventing entertainment. Experience spatial movie streaming, real-time shared audio queues, and instant AAA & retro canvas arcade gameplay inside a high-fidelity glassmorphic dashboard.",
  keywords: ["Next.js 15", "OTT", "Gaming Console", "Spotify Deck", "Tailwind CSS", "Three.js", "Zustand", "Redis Cache"],
  openGraph: {
    title: "StreamFlare - Premium Space OTT, Audio, & Retro Gaming Console",
    description:
      "Spatial entertainment, cinematic streaming, shared lossless audio lobbies, and retro arcade emulation inside an Apple Vision Pro style dashboard.",
    url: "https://streamflare.io",
    siteName: "StreamFlare",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "StreamFlare Spatial Hub",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamFlare - Spatial Entertainment Hub",
    description: "Cinematic movie browse, shared audio rooms, and retro arcade emulator dashboards.",
    images: ["https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#020617] text-white min-h-screen flex flex-col antialiased">
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <ClientShell />
          <ConditionalMain>{children}</ConditionalMain>
        </ClerkProvider>
      </body>
    </html>
  );
}
