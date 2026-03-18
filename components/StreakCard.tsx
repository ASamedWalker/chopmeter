"use client";

import { useState } from "react";
import { Flame, ChevronDown, Shield, Snowflake } from "lucide-react";
import type { StreakData, TrackerLevelInfo } from "@/lib/types";

interface StreakCardProps {
  streak: StreakData;
  level: TrackerLevelInfo;
  nextLevel: TrackerLevelInfo | null;
  status: "active" | "at_risk" | "lost";
  onScanNow?: () => void;
}

export default function StreakCard({
  streak,
  level,
  nextLevel,
  status,
  onScanNow,
}: StreakCardProps) {
  const [expanded, setExpanded] = useState(false);

  const flameColor =
    status === "active"
      ? "#EF4444"
      : status === "at_risk"
      ? "#F59E0B"
      : "#6B7280";

  const streakLabel =
    streak.currentStreak === 0
      ? "No streak yet"
      : `${streak.currentStreak}-day streak`;

  return (
    <div
      className={`glass-card p-4 mb-4 animate-fade-in-up cursor-pointer transition-all ${
        status === "at_risk" ? "ring-1 ring-amber-500/30" : ""
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Flame icon */}
          <div className="relative">
            <Flame
              size={24}
              color={flameColor}
              fill={status === "active" ? flameColor : "none"}
              className={status === "active" ? "animate-pulse" : ""}
            />
            {streak.currentStreak > 0 && (
              <span className="absolute -top-1 -right-2 text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-full w-4 h-4 flex items-center justify-center">
                {streak.currentStreak > 99 ? "99+" : streak.currentStreak}
              </span>
            )}
          </div>

          <div>
            <span className="text-white text-sm font-bold">{streakLabel}</span>
            {status === "at_risk" && (
              <p className="text-amber-400 text-[10px] font-medium mt-0.5">
                Scan today to keep your streak!
              </p>
            )}
            {status === "lost" && streak.longestStreak > 0 && (
              <p className="text-gray-500 text-[10px] mt-0.5">
                Best: {streak.longestStreak} days
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tracker level badge */}
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              color: level.color,
              backgroundColor: `${level.color}15`,
              border: `1px solid ${level.color}30`,
            }}
          >
            {level.name}
          </span>
          <ChevronDown
            size={14}
            className={`text-gray-500 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Weekly dots */}
      <div className="flex items-center gap-1.5 mt-3">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                streak.weeklyScans[i]
                  ? "bg-gradient-to-br from-blue-500 to-violet-500 shadow-sm shadow-blue-500/30"
                  : "bg-white/[0.06] border border-white/[0.08]"
              }`}
            >
              {streak.weeklyScans[i] && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="text-[8px] text-gray-500 font-medium">{day}</span>
          </div>
        ))}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2.5 animate-fade-in-up">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-white text-lg font-bold">
                {streak.totalScans}
              </p>
              <p className="text-gray-500 text-[10px]">Total Scans</p>
            </div>
            <div className="text-center">
              <p className="text-white text-lg font-bold">
                {streak.longestStreak}
              </p>
              <p className="text-gray-500 text-[10px]">Best Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Snowflake size={12} className="text-blue-400" />
                <p className="text-white text-lg font-bold">
                  {streak.streakFreezes}
                </p>
              </div>
              <p className="text-gray-500 text-[10px]">Freezes</p>
            </div>
          </div>

          {/* Next level progress */}
          {nextLevel && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-400">
                  Next: {nextLevel.name}
                </span>
                <span className="text-gray-500">
                  {streak.totalScans}/{nextLevel.minScans} scans
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (streak.totalScans / nextLevel.minScans) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* CTA for lost streak */}
          {status === "lost" && onScanNow && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onScanNow();
              }}
              className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xs font-bold active:scale-[0.97] transition-transform"
            >
              Start a New Streak
            </button>
          )}
        </div>
      )}
    </div>
  );
}
