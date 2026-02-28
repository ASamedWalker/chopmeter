"use client";

import { useRouter } from "next/navigation";
import { Home, ScanLine, Lightbulb, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BottomNavProps {
  active: "dashboard" | "scanner" | "tips" | "settings";
}

const NAV_ITEMS: {
  key: string;
  label: string;
  Icon: LucideIcon;
  href: string;
}[] = [
  { key: "dashboard", label: "Home", Icon: Home, href: "/dashboard" },
  { key: "scanner", label: "Scan", Icon: ScanLine, href: "/scanner" },
  { key: "tips", label: "Tips", Icon: Lightbulb, href: "/tips" },
  { key: "settings", label: "Settings", Icon: Settings, href: "/settings" },
];

export default function BottomNav({ active }: BottomNavProps) {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-safe mb-1">
      <div className="max-w-2xl mx-auto flex items-center justify-around py-2.5 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/30">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                navigator.vibrate?.(10);
                router.push(item.href);
              }}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all duration-200 active:scale-[0.95] ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <item.Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.5}
                fill={isActive ? "currentColor" : "none"}
              />
              <span
                className={`text-[10px] font-semibold ${
                  isActive ? "text-white" : ""
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
