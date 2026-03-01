import React from "react";

interface TeamForgeVoronoiProps {
  className?: string;
  showBackground?: boolean;
}

export const TeamForgeLogo: React.FC<TeamForgeVoronoiProps> = ({
  className = "w-12 h-12",
  showBackground = true,
}) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TeamForge Logo: The Voronoi Nexus"
    >
      <defs>
        <clipPath id="group-boundary">
          <rect x="16" y="16" width="88" height="88" rx="24" />
        </clipPath>
      </defs>

      {showBackground && (
        <rect width="120" height="120" rx="24" fill="#FAFAF8" />
      )}

      <g clipPath="url(#group-boundary)">
        {/* The k-NN Quadrants
            Color: Forge Teal with varying opacities to represent
            the diverse 4D MBTI vectors of the 4 group members.
            Stroke: Canvas (#FAFAF8) creates the physical boundaries.
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

      {/* The Greedy Matching Apex
          Color: Spark Amber. Represents the MGS (Marginal Group Score)
          convergence point where the SocialBonus finalizes the group.
      */}
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
};
