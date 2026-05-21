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
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={{
            variables: {
              colorPrimary: "#7c3aed",
              colorBackground: "#071022",
              colorText: "#e6eef9",
              colorTextSecondary: "#94a3b8",
              colorInputBackground: "#071225",
              colorInputText: "#e6eef9",
              colorNeutral: "#6b7280",
              borderRadius: "12px",
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              fontSize: "15px",
            },
            elements: {
              rootBox: "w-full",
              card: "bg-transparent border-0 shadow-none",
              headerTitle: "text-white font-extrabold",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "bg-gradient-to-r from-slate-900 to-slate-800 border border-white/5 text-white shadow-lg",
              socialButtonsBlockButtonText: "text-white",
              dividerLine: "bg-white/5",
              dividerText: "text-slate-400",
              formFieldLabel: "text-slate-300",
              formFieldInput: "bg-[#071225] border border-white/5 text-white",
              formButtonPrimary: "bg-gradient-to-r from-purple-600 to-cyan-400 font-extrabold shadow-xl",
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
