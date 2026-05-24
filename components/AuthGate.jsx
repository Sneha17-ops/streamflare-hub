"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function AuthGate({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const path = usePathname();

  React.useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      const redirectTo = encodeURIComponent(path || "/");
      router.push(`/sign-in?redirectTo=${redirectTo}`);
    }
  }, [isLoaded, isSignedIn, router, path]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[24rem]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
      </div>
    );
  }

  return <>{children}</>;
}
