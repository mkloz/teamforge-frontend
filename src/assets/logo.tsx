import { useId } from "react";

interface FindafewVoronoiProps {
  className?: string;
  showBackground?: boolean;
}

export function FindafewLogo({
  className = "size-12",
  showBackground = true,
}: FindafewVoronoiProps) {
  const groupBoundaryId = useId();

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={groupBoundaryId}>
          <rect x="16" y="16" width="88" height="88" rx="8" />
        </clipPath>
      </defs>

      {showBackground && (
        <rect width="120" height="120" rx="8" fill="#FAFAF8" />
      )}

      <g clipPath={`url(#${groupBoundaryId})`}>
        {/* Four group regions
 Color: brand teal with varying opacities keeps each member distinct.
 Stroke: Canvas (#FAFAF8) creates the boundaries.
 */}
        <g stroke="#FAFAF8" strokeWidth="5" strokeLinejoin="round">
          <polygon
            points="52,68 40,-10 130,-10 130,50"
            fill="#0D9488"
            fillOpacity="1.0"
          />

          <polygon
            points="52,68 130,50 130,130 70,130"
            fill="#0D9488"
            fillOpacity="0.66"
          />

          <polygon
            points="52,68 70,130 -10,130 -10,80"
            fill="#0D9488"
            fillOpacity="0.83"
          />

          <polygon
            points="52,68 -10,80 -10,-10 40,-10"
            fill="#0D9488"
            fillOpacity="0.50"
          />
        </g>
      </g>

      {/* The amber apex marks the point where the group comes together. */}
      <circle
        cx="52"
        cy="68"
        r="10"
        fill="#F59E0B"
        stroke="#FAFAF8"
        strokeWidth="3"
      />
    </svg>
  );
}
