"use client";

import { useRef, useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { Share2, Download, MessageCircle, Loader2 } from "lucide-react";

interface ShareCardProps {
  /** Card type determines the rendered content */
  type: "monthly-summary" | "achievement";
  /** Data for monthly summary card */
  summary?: {
    month: string;
    totalUsage: number;
    totalCost: number;
    dailyAverage: number;
    readingCount: number;
    changePercent: number;
    changeDirection: "up" | "down" | "flat";
    currencySymbol: string;
    userName: string;
    streakDays: number;
    trackerLevel: string;
  };
  /** Data for achievement share card */
  achievement?: {
    name: string;
    description: string;
    tier: "bronze" | "silver" | "gold" | "platinum";
    iconColor: string;
    userName: string;
  };
}

const TIER_GRADIENTS: Record<string, string> = {
  bronze: "linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)",
  silver: "linear-gradient(135deg, #C0C0C0 0%, #808080 100%)",
  gold: "linear-gradient(135deg, #FFD700 0%, #DAA520 100%)",
  platinum: "linear-gradient(135deg, #E5E4E2 0%, #BCC6CC 100%)",
};

export default function ShareCard({ type, summary, achievement }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0A0E1A",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
      });
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    const blob = await generateImage();
    if (!blob) return;

    const file = new File([blob], "chopmeter-share.png", { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: type === "monthly-summary"
            ? "My ChopMeter Monthly Summary"
            : `I earned "${achievement?.name}" on ChopMeter!`,
          text: type === "monthly-summary"
            ? "Check out my electricity usage summary from ChopMeter"
            : `I just earned the "${achievement?.name}" badge on ChopMeter! Track your electricity at chopmeter.me`,
          files: [file],
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to download
      }
    }

    // Fallback: download the image
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chopmeter-share.png";
    a.click();
    URL.revokeObjectURL(url);
  }, [generateImage, type, achievement]);

  const handleDownload = useCallback(async () => {
    const blob = await generateImage();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chopmeter-share.png";
    a.click();
    URL.revokeObjectURL(url);
  }, [generateImage]);

  return (
    <div>
      {/* The card that gets rendered to image */}
      <div
        ref={cardRef}
        style={{
          width: 360,
          padding: 24,
          background: "linear-gradient(135deg, #0A0E1A 0%, #151B2E 50%, #0A0E1A 100%)",
          borderRadius: 20,
          fontFamily: "'Poppins', 'Segoe UI', sans-serif",
          color: "#F9FAFB",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 160,
            height: 160,
            background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Header: ChopMeter branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, position: "relative" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>ChopMetr</div>
            <div style={{ fontSize: 9, color: "#9CA3AF", fontWeight: 500 }}>Know where your light money dey go</div>
          </div>
        </div>

        {type === "monthly-summary" && summary && (
          <div style={{ position: "relative" }}>
            {/* Month title */}
            <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600, marginBottom: 4 }}>
              Monthly Summary
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
              {summary.month}
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <StatBox label="Total Usage" value={`${summary.totalUsage.toFixed(1)} kWh`} />
              <StatBox label="Total Cost" value={`${summary.currencySymbol} ${summary.totalCost.toFixed(2)}`} />
              <StatBox label="Daily Average" value={`${summary.dailyAverage.toFixed(1)} kWh`} />
              <StatBox label="Readings" value={`${summary.readingCount}`} />
            </div>

            {/* Trend */}
            {summary.changeDirection !== "flat" && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: summary.changeDirection === "down"
                    ? "rgba(16, 185, 129, 0.1)"
                    : "rgba(239, 68, 68, 0.1)",
                  border: `1px solid ${summary.changeDirection === "down" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>
                  {summary.changeDirection === "down" ? "📉" : "📈"}
                </span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: summary.changeDirection === "down" ? "#10B981" : "#EF4444",
                }}>
                  {summary.changeDirection === "down" ? "↓" : "↑"} {Math.abs(summary.changePercent).toFixed(0)}% vs last month
                </span>
              </div>
            )}

            {/* User info row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              {summary.userName && (
                <div style={{ fontSize: 11, color: "#6B7280" }}>
                  Tracked by <span style={{ color: "#9CA3AF", fontWeight: 600 }}>{summary.userName}</span>
                </div>
              )}
              {summary.streakDays > 0 && (
                <div style={{ fontSize: 11, color: "#F97316", fontWeight: 600 }}>
                  🔥 {summary.streakDays}-day streak
                </div>
              )}
            </div>
          </div>
        )}

        {type === "achievement" && achievement && (
          <div style={{ position: "relative", textAlign: "center", padding: "8px 0" }}>
            {/* Badge circle */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: TIER_GRADIENTS[achievement.tier],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: `0 0 30px ${achievement.iconColor}40`,
              }}
            >
              <span style={{ fontSize: 32 }}>🏆</span>
            </div>

            <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
              Achievement Unlocked
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
              {achievement.name}
            </div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>
              {achievement.description}
            </div>

            {/* Tier badge */}
            <div
              style={{
                display: "inline-block",
                padding: "4px 14px",
                borderRadius: 20,
                background: TIER_GRADIENTS[achievement.tier],
                fontSize: 11,
                fontWeight: 700,
                color: achievement.tier === "gold" || achievement.tier === "bronze" ? "#1F2937" : "#F9FAFB",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 16,
              }}
            >
              {achievement.tier}
            </div>

            {achievement.userName && (
              <div style={{ fontSize: 11, color: "#6B7280" }}>
                Earned by <span style={{ color: "#9CA3AF", fontWeight: 600 }}>{achievement.userName}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 10, color: "#6B7280" }}>chopmeter.me</div>
          <div style={{ fontSize: 10, color: "#6B7280" }}>Track your electricity spending</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleShare}
          disabled={generating}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold py-3 px-4 rounded-xl text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
          Share
        </button>
        <button
          onClick={handleDownload}
          disabled={generating}
          className="flex items-center justify-center gap-2 bg-white/[0.05] border border-white/[0.08] text-white font-bold py-3 px-4 rounded-xl text-sm hover:bg-white/[0.08] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
