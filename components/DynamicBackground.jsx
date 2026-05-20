"use client";

import React from "react";
import dynamic from "next/dynamic";

const ThreeBackground = dynamic(() => import("./ThreeBackground"), { ssr: false });
const SpotlightCursor = dynamic(() => import("./SpotlightCursor"), { ssr: false });

export default function DynamicBackground() {
  return (
    <>
      <ThreeBackground />
      <SpotlightCursor />
    </>
  );
}
