"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSettings } from "@/lib/storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const settings = getSettings();
    if (settings.onboardingComplete) {
      router.replace("/dashboard");
    } else {
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-bg-dark">
      <span className="material-symbols-outlined text-primary text-5xl animate-pulse">
        electric_bolt
      </span>
    </div>
  );
}
