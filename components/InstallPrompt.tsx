"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const stored = sessionStorage.getItem("installDismissed");
    if (stored) {
      setDismissed(true);
      return;
    }

    if (isIOS()) {
      setShowIOSPrompt(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("installDismissed", "1");
  };

  if (dismissed || isStandalone()) return null;

  // Android / Chrome install
  if (deferredPrompt) {
    const handleInstall = async () => {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
      handleDismiss();
    };

    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-violet-500 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Download className="text-white shrink-0" size={20} />
          <p className="text-white font-bold text-sm truncate">
            Install ChopMetr for offline use
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDismiss}
            className="text-white/60 text-sm font-medium hover:text-white"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="bg-white/20 text-white border border-white/20 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-white/30 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari prompt
  if (showIOSPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-dark/95 backdrop-blur-xl border-t border-white/[0.08] px-5 py-4 pb-8">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-white"
        >
          <X size={18} />
        </button>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 shrink-0">
            <Download size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Install ChopMetr</p>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              Tap <Share size={14} className="inline text-blue-400 -mt-0.5" /> then <span className="text-white font-semibold">&quot;Add to Home Screen&quot;</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
