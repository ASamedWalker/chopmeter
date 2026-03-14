"use client";

import { AlertTriangle, Zap, TrendingDown } from "lucide-react";

interface LowBalanceAlertProps {
  daysLeft: number | null;
  currentBalance: number;
  dailyBurnRate: number;
  currencySymbol: string;
  onScanNow: () => void;
}

export default function LowBalanceAlert({
  daysLeft,
  currentBalance,
  dailyBurnRate,
  currencySymbol,
  onScanNow,
}: LowBalanceAlertProps) {
  if (daysLeft === null || daysLeft > 7 || currentBalance <= 0) return null;

  const isCritical = daysLeft <= 3;
  const emptyDate = new Date();
  emptyDate.setDate(emptyDate.getDate() + daysLeft);
  const emptyDateStr = emptyDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={`rounded-2xl p-4 border ${
        isCritical
          ? "bg-red-500/[0.08] border-red-500/20"
          : "bg-yellow-500/[0.06] border-yellow-500/15"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
            isCritical ? "bg-red-500/20" : "bg-yellow-500/15"
          }`}
        >
          {isCritical ? (
            <AlertTriangle size={20} className="text-red-400" />
          ) : (
            <TrendingDown size={20} className="text-yellow-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${isCritical ? "text-red-400" : "text-yellow-400"}`}>
            {isCritical ? "Credit running out!" : "Low balance warning"}
          </p>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            {daysLeft === 0
              ? "Your credit may run out today."
              : `About ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left — estimated empty by ${emptyDateStr}.`}{" "}
            At {currencySymbol}
            {dailyBurnRate.toFixed(2)}/day, consider topping up{" "}
            {isCritical ? "now" : "soon"}.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={onScanNow}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-[0.97] ${
                isCritical
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25"
              }`}
            >
              <Zap size={12} />
              Update Reading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
