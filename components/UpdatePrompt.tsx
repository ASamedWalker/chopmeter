"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

export default function UpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      // Check if there's already a waiting worker
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(newWorker);
          }
        });
      });
    });

    // Reload when the new SW takes over
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    // Check for updates when user returns to app
    const checkUpdate = () => {
      navigator.serviceWorker.ready.then((reg) => reg.update());
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkUpdate();
    });
  }, []);

  const handleUpdate = useCallback(() => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }, [waitingWorker]);

  if (!waitingWorker) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-[#141822] border border-blue-500/30 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-xl shadow-black/40">
        <div className="flex items-center gap-3 min-w-0">
          <RefreshCw size={18} className="text-blue-400 shrink-0" />
          <p className="text-white text-sm font-semibold truncate">
            New version available
          </p>
        </div>
        <button
          onClick={handleUpdate}
          className="shrink-0 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-bold hover:shadow-lg transition-all active:scale-[0.97]"
        >
          Update
        </button>
      </div>
    </div>
  );
}
