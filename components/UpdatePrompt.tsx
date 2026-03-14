"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export default function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setShowUpdate(true);
          }
        });
      });
    });

    // Also check on visibility change (user returns to app)
    const checkUpdate = () => {
      navigator.serviceWorker.ready.then((reg) => reg.update());
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkUpdate();
    });
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-[#141822] border border-blue-500/30 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-xl shadow-black/40">
        <div className="flex items-center gap-3 min-w-0">
          <RefreshCw size={18} className="text-blue-400 shrink-0" />
          <p className="text-white text-sm font-semibold truncate">
            A new version is available
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="shrink-0 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-bold hover:shadow-lg transition-all"
        >
          Update
        </button>
      </div>
    </div>
  );
}
