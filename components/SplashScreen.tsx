"use client";

import { useEffect, useState } from "react";
import { ChopMeterLogo, ChopMeterTagline } from "@/components/ChopMeterLogo";

/**
 * Modern splash screen — same ChopMetr logo used on the landing page.
 * Inspired by Revolut/Cash App: centered logo scales in, tagline fades up,
 * subtle loading bar, then fades out to reveal the dashboard.
 */
export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 50);
    const t2 = setTimeout(() => setPhase("exit"), 2000);
    const t3 = setTimeout(onFinish, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  const entered = phase !== "enter";
  const exiting = phase === "exit";

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: "#0A0E1A",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.6s ease-out",
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)",
          opacity: entered ? 1 : 0,
          transform: entered ? "scale(1)" : "scale(0.4)",
          transition: "all 1s ease-out",
          pointerEvents: "none",
        }}
      />

      {/* ChopMetr wordmark logo — same as landing page */}
      <div
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? "scale(1)" : "scale(0.7)",
          transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <ChopMeterLogo size={180} color="#FFFFFF" />
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 16,
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0)" : "translateY(15px)",
          transition: "all 0.6s ease-out 0.25s",
        }}
      >
        <ChopMeterTagline color="rgba(255,255,255,0.3)" />
      </div>

      {/* Bottom loading indicator — thin animated line like Revolut */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          width: 40,
          height: 3,
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "rgba(255,255,255,0.06)",
          opacity: entered && !exiting ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 2,
            background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
            animation: "splash-progress 1.5s ease-in-out infinite",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes splash-progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
