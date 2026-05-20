"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function BlurImage({ src, alt, className, ...props }) {
  const [isLoading, setLoading] = useState(true);
  const sizes = props.fill && !props.sizes ? "100vw" : props.sizes;

  return (
    <div className="relative overflow-hidden w-full h-full bg-slate-900/60 rounded-lg">
      <Image
        src={src}
        alt={alt}
        sizes={sizes}
        className={`
          smooth-transition duration-700 ease-in-out
          ${isLoading 
            ? "scale-105 blur-2xl grayscale" 
            : "scale-100 blur-0 grayscale-0"
          }
          ${className}
        `}
        onLoad={() => setLoading(false)}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/40 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
