"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSettings } from "@/lib/storage";
import { Zap } from "lucide-react";

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
      <Zap className="text-blue-400 animate-pulse" size={48} />
    </div>
  );
}
