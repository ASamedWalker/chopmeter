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

      {/* "o" with lightning bolt striking through — bolt extends well outside circle */}
      <circle cx="68" cy="24" r="14" stroke={color} strokeWidth="3" fill="none" />
      <path
        d="M67 2 L60 24 H67 L62 46 L78 18 H70 L75 2 Z"
        fill="#3B82F6"
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
      className={`text-xs font-semibold tracking-[0.12em] uppercase whitespace-nowrap ${className}`}
      style={{ color }}
    >
      Your meter. Your money. Your control.
    </p>
  );
}
