"use client";

import { useRouter } from "next/navigation";

interface BottomNavProps {
  active: "dashboard" | "scanner" | "tips" | "settings";
}

const NAV_ITEMS = [
  { key: "dashboard", label: "Home", icon: "home", href: "/dashboard" },
  { key: "scanner", label: "Scan", icon: "qr_code_scanner", href: "/scanner" },
  { key: "tips", label: "Tips", icon: "tips_and_updates", href: "/tips" },
  { key: "settings", label: "Settings", icon: "settings", href: "/settings" },
] as const;

export default function BottomNav({ active }: BottomNavProps) {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-dark/95 backdrop-blur-md border-t border-surface-border pb-safe">
      <div className="max-w-2xl mx-auto flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span
                className={`material-symbols-outlined text-2xl ${
                  isActive ? "filled" : ""
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
