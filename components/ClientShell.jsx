"use client";

import dynamic from "next/dynamic";
import Navbar from "./Navbar";
import { useUser } from "@clerk/nextjs";

const MusicPlayer = dynamic(() => import("./MusicPlayer"), { ssr: false });
const GlobalSearch = dynamic(() => import("./GlobalSearch"), { ssr: false });
const DynamicBackground = dynamic(() => import("./DynamicBackground"), { ssr: false });

export default function ClientShell() {
  const { isSignedIn } = useUser();

  return (
    <>
      <DynamicBackground />
      <Navbar />
      {isSignedIn && (
        <>
          <GlobalSearch />
          <MusicPlayer />
        </>
      )}
    </>
  );
}
