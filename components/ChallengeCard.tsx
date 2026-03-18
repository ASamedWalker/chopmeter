"use client";

import { Target, Check, Clock } from "lucide-react";
import type { Challenge } from "@/lib/types";

interface ChallengeCardProps {
  challenge: Challenge | null;
  currencySymbol: string;
}

export default function ChallengeCard({
  challenge,
  currencySymbol,
}: ChallengeCardProps) {
  if (!challenge || challenge.status !== "active") return null;

  const daysLeft = Math.max(
    0,
    Math.ceil((challenge.endDate - Date.now()) / 86400000)
  );

  // For currency challenges, progress is inverted (lower is better)
  const progress =
    challenge.unit === "currency"
      ? Math.min(100, (challenge.current / challenge.target) * 100)
      : Math.min(100, (challenge.current / challenge.target) * 100);

  const isClose = progress >= 80;
  const barColor =
    challenge.unit === "currency"
      ? progress >= 90
        ? "from-red-500 to-red-400"
        : progress >= 70
        ? "from-amber-500 to-orange-400"
        : "from-emerald-500 to-emerald-400"
      : "from-blue-500 to-violet-500";

  const progressLabel =
    challenge.unit === "days"
      ? `${challenge.current} of ${challenge.target} days`
      : `${currencySymbol}${challenge.current} / ${currencySymbol}${challenge.target}`;

  return (
    <div className="glass-card p-4 mb-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-violet-400" />
          <span className="text-white text-xs font-bold uppercase tracking-wider">
            Challenge
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Clock size={10} />
          <span className="text-[10px] font-medium">{daysLeft}d left</span>
        </div>
      </div>

      <p className="text-white text-sm font-semibold mb-1">
        {challenge.title}
      </p>
      <p className="text-gray-500 text-[11px] mb-3">{challenge.description}</p>

      {/* Progress bar */}
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-1.5 budget-track">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400 text-[10px]">{progressLabel}</span>
        {isClose && challenge.unit === "days" && (
          <span className="text-emerald-400 text-[10px] font-medium flex items-center gap-0.5">
            <Check size={10} /> Almost there!
          </span>
        )}
      </div>
    </div>
  );
}
