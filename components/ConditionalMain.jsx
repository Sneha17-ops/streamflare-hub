"use client";

import { usePathname } from "next/navigation";

export default function ConditionalMain({ children }) {
  const pathname = usePathname();
  // Sign-in and landing pages should be full-bleed (no padding/max-width)
  const isFullBleed = pathname === "/" || pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  if (isFullBleed) {
    return <main className="flex-1 relative z-10">{children}</main>;
  }

  return (
    <main className="flex-1 pt-28 pb-36 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
      {children}
    </main>
  );
}
