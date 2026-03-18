"use client";

import { useEffect, useState } from "react";
import {
  ScanLine,
  Wallet,
  PlusCircle,
  Activity,
  Flame,
  Target,
  Award,
  Crown,
  ShieldCheck,
  Eye,
  Search,
  Trophy,
  TrendingDown,
} from "lucide-react";
import type { Achievement } from "@/lib/types";

const ICON_MAP: Record<string, React.ElementType> = {
  "scan-line": ScanLine,
  wallet: Wallet,
  "plus-circle": PlusCircle,
  activity: Activity,
  flame: Flame,
  target: Target,
  award: Award,
  crown: Crown,
  "shield-check": ShieldCheck,
  eye: Eye,
  search: Search,
  trophy: Trophy,
  "trending-down": TrendingDown,
};

const TIER_GLOW: Record<string, string> = {
  bronze: "from-amber-700/40 to-orange-600/40",
  silver: "from-gray-300/30 to-gray-400/30",
  gold: "from-yellow-400/40 to-amber-500/40",
  platinum: "from-gray-200/30 to-white/20",
};

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  onViewAll?: () => void;
}

export default function AchievementToast({
  achievement,
  onDismiss,
  onViewAll,
}: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  const Icon = ICON_MAP[achievement.icon] || Award;
  const glow = TIER_GLOW[achievement.tier] || TIER_GLOW.bronze;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r ${glow} backdrop-blur-xl shadow-2xl`}
        onClick={() => {
          setVisible(false);
          setTimeout(() => {
            onDismiss();
            onViewAll?.();
          }, 300);
        }}
      >
        {/* Shimmer overlay for gold/platinum */}
        {(achievement.tier === "gold" || achievement.tier === "platinum") && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        )}

        <div className="relative flex items-center gap-3 p-4">
          {/* Badge icon */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${achievement.iconColor}20`,
              border: `2px solid ${achievement.iconColor}40`,
            }}
          >
            <Icon size={22} color={achievement.iconColor} />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-0.5">
              New Achievement!
            </p>
            <p className="text-white text-sm font-bold truncate">
              {achievement.name}
            </p>
            <p className="text-gray-300 text-[11px] truncate">
              {achievement.description}
            </p>
          </div>

          {/* Tier badge */}
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              color: achievement.iconColor,
              backgroundColor: `${achievement.iconColor}15`,
            }}
          >
            {achievement.tier}
          </span>
        </div>
      </div>
    </div>
  );
}
