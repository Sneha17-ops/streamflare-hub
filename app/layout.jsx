import React from "react";
import ClientShell from "../components/ClientShell";
import ConditionalMain from "../components/ConditionalMain";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

export const metadata = {
  title: "StreamFlare - AI Entertainment Ecosystem",
  description:
    "An AI-powered entertainment ecosystem with cinematic streaming, semantic search, synchronized rooms, cloud arcade gaming, and immersive music playback.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  keywords: ["Next.js 15", "AI entertainment", "OTT", "Spotify", "Steam", "Discord", "Three.js", "Zustand", "Redis Cache", "Socket.IO"],
  openGraph: {
    title: "StreamFlare - AI Entertainment Ecosystem",
    description:
      "Cinematic streaming, AI mood recommendations, synchronized listening rooms, cloud arcade gaming, and futuristic watch parties.",
    url: "https://streamflare.io",
    siteName: "StreamFlare",
    images: [
      {
        url: "/assets/hero-bg.jpg",
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
    title: "StreamFlare - AI Entertainment Ecosystem",
    description: "AI mood discovery, semantic search, synchronized rooms, and cinematic playback.",
    images: ["/assets/hero-bg.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts used by the thumbnail editor presets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&family=Bebas+Neue&family=Orbitron:wght@500;700&family=Bungee&family=Cinzel:wght@700&family=Noto+Sans+JP:wght@700&family=Rajdhani:wght@400;700&family=Montserrat:wght@700&family=Anton&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#020617] text-white min-h-screen flex flex-col antialiased overflow-x-hidden" suppressHydrationWarning>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_bW9jay1rZXkuY2xlcmsuYWNjb3VudHMuZGV2JA"}
          appearance={{
            variables: {
              colorPrimary: "#9b5cff",
              colorBackground: "#0b0f14",
              colorText: "#e6eef9",
              colorTextSecondary: "#94a3b8",
              colorInputBackground: "rgba(15,23,42,0.6)",
              colorInputText: "#e6eef9",
              colorNeutral: "#6b7280",
              borderRadius: "14px",
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              fontSize: "15px",
            },
            elements: {
              rootBox: "w-full",
              card: "glass-panel-heavy rounded-2xl p-6",
              headerTitle: "text-white font-extrabold text-lg",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "flex items-center justify-center gap-3 rounded-xl px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-2xl border border-white/5",
              socialButtonsBlockButtonText: "text-white font-semibold",
              dividerLine: "bg-white/5",
              dividerText: "text-slate-400",
              formFieldLabel: "text-slate-300",
              formFieldInput: "glass-input rounded-lg px-4 py-3 text-white",
              formButtonPrimary: "bg-gradient-to-r from-purple-500 to-pink-500 font-extrabold rounded-xl px-6 py-3 shadow-2xl text-white",
              footerActionLink: "text-purple-300",
              footerActionText: "text-slate-400",
            },
          }}
        >
          <ClientShell />
          <ConditionalMain>{children}</ConditionalMain>
        </ClerkProvider>
      </body>
    </html>
  );
}
