import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ChopMeter - Track Your Prepaid Electricity Usage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0E1A",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
            marginBottom: 40,
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="white"
            stroke="none"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            marginBottom: 16,
          }}
        >
          ChopMeter
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#94A3B8",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Track your prepaid electricity usage and save money
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 48,
            fontSize: 20,
            color: "#60A5FA",
          }}
        >
          <span>Scan Meter</span>
          <span style={{ color: "#475569" }}>|</span>
          <span>Track Usage</span>
          <span style={{ color: "#475569" }}>|</span>
          <span>Save Money</span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "#475569",
          }}
        >
          chopmeter.me — Free, Offline, No Signup
        </div>
      </div>
    ),
    { ...size }
  );
}
