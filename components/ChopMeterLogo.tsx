/**
 * ChopMeter wordmark logo with lightning bolt integrated into the "o".
 * Matches the brand identity from the Sora marketing video.
 */
export function ChopMeterLogo({
  size = 200,
  color = "#FFFFFF",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  // The viewBox is designed so the text + bolt fits cleanly
  const scale = size / 200;
  const height = 48 * scale;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 200 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ChopMetr"
    >
      {/* "Ch" */}
      <text
        x="0"
        y="36"
        fontFamily="'Poppins', 'Inter', system-ui, sans-serif"
        fontWeight="800"
        fontSize="36"
        fill={color}
        letterSpacing="-0.5"
      >
        Ch
      </text>

      {/* "o" replaced with lightning bolt in circle */}
      <circle cx="68" cy="24" r="14" stroke={color} strokeWidth="3" fill="none" />
      <path
        d="M65 16 L62 26 H67 L64 32 L73 22 H68 L71 16 Z"
        fill={color}
      />

      {/* "pMetr" */}
      <text
        x="83"
        y="36"
        fontFamily="'Poppins', 'Inter', system-ui, sans-serif"
        fontWeight="800"
        fontSize="36"
        fill={color}
        letterSpacing="-0.5"
      >
        pMetr
      </text>
    </svg>
  );
}

export function ChopMeterTagline({
  color = "rgba(255,255,255,0.6)",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <p
      className={`text-sm font-semibold tracking-[0.25em] uppercase ${className}`}
      style={{ color }}
    >
      Predict. Plan. Power.
    </p>
  );
}
