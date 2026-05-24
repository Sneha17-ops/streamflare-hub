"use client";

import dynamic from "next/dynamic";
import Navbar from "./Navbar";
import { useUser } from "@clerk/nextjs";
import UserProgressSync from "./UserProgressSync";
import { useEffect } from "react";

const MusicPlayer = dynamic(() => import("./MusicPlayer"), { ssr: false });
const GlobalSearch = dynamic(() => import("./GlobalSearch"), { ssr: false });
const DynamicBackground = dynamic(() => import("./DynamicBackground"), { ssr: false });

// Selectors that match Clerk dev banners & keyless mode prompts
const CLERK_BANNER_SELECTORS = [
  "[data-clerk-portal]",
  ".__clerk_container",
  "[class*='cl-keyless']",
  "[class*='cl-devBadge']",
  "[class*='cl-developmentMode']",
  "[id^='clerk-']",
];

const CLERK_TEXT_PATTERNS = [
  /temporary api keys/i,
  /configure your application/i,
  /keyless/i,
  /development mode/i,
  /claim your keys/i,
  /you've created your first user/i,
];

function hideClerkBanners() {
  try {
    // 1. Try CSS selector matches
    CLERK_BANNER_SELECTORS.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        el.style.setProperty("display", "none", "important");
      });
    });

    // 2. Check fixed/absolute positioned elements with Clerk text
    document.querySelectorAll("body > div").forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.position === "fixed" || style.position === "absolute") {
        const txt = el.textContent || "";
        if (CLERK_TEXT_PATTERNS.some((p) => p.test(txt))) {
          el.style.setProperty("display", "none", "important");
        }
      }
    });

    // 3. Text-based match across all elements (fallback)
    const path = window.location.pathname || "";
    if (!path.includes("/sign-in") && !path.includes("/sign-up")) {
      document.querySelectorAll("body *").forEach((el) => {
        if (!el || !el.textContent || el.children.length > 3) return;
        const txt = el.textContent.trim();
        if (!txt) return;
        if (CLERK_TEXT_PATTERNS.some((p) => p.test(txt))) {
          // Do not hide if it's inside the actual sign-in/sign-up card, popups or user buttons
          if (el.closest('.cl-card') || el.closest('.cl-rootBox') || el.closest('.cl-userButtonPopoverCard') || el.closest('[class*="cl-"]')) return;
          const root = el.closest("[style*='position']") || el.closest("div") || el;
          root.style.setProperty("display", "none", "important");
        }
      });
    }
  } catch (_) {}
}

export default function ClientShell() {
  const { isSignedIn } = useUser();

  useEffect(() => {
    // Initial attempt after Clerk loads
    const t1 = setTimeout(hideClerkBanners, 600);
    const t2 = setTimeout(hideClerkBanners, 1500);
    const t3 = setTimeout(hideClerkBanners, 3000);

    // MutationObserver: suppress banners as soon as Clerk injects them
    const observer = new MutationObserver(() => {
      hideClerkBanners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <DynamicBackground />
      <Navbar />
      <UserProgressSync />
      {isSignedIn && (
        <>
          <GlobalSearch />
          <MusicPlayer />
        </>
      )}
    </>
  );
}
