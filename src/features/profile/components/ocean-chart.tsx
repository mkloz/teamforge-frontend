import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import type { OceanScores, OceanTraitKey } from "../types/profile.types";
import { OCEAN_TRAITS, getTraitLevel } from "../lib/ocean-traits";

interface OceanChartProps {
  scores: OceanScores;
  size?: number;
}

// Pentagon vertices calculation (5 points, starting from top)
function getPolygonPoints(centerX: number, centerY: number, radius: number, sides: number = 5): [number, number][] {
  const points: [number, number][] = [];
  const angleOffset = -Math.PI / 2; // Start from top
  
  for (let i = 0; i < sides; i++) {
    const angle = angleOffset + (2 * Math.PI * i) / sides;
    points.push([
      centerX + radius * Math.cos(angle),
      centerY + radius * Math.sin(angle),
    ]);
  }
  return points;
}

// Convert points array to SVG path string
function pointsToPath(points: [number, number][]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z";
}

// Order of traits on the pentagon (clockwise from top)
const TRAIT_ORDER: OceanTraitKey[] = [
  "openness",        // Top
  "conscientiousness", // Top-right
  "extraversion",    // Bottom-right
  "agreeableness",   // Bottom-left
  "neuroticism",     // Top-left
];

export function OceanChart({ scores, size = 280 }: OceanChartProps) {
  const [selectedTrait, setSelectedTrait] = useState<OceanTraitKey | null>(null);
  
  const center = size / 2;
  const maxRadius = (size / 2) - 40; // Leave room for labels
  
  // Grid rings at 25%, 50%, 75%, 100%
  const gridRings = [0.25, 0.5, 0.75, 1.0];
  
  // Calculate data points based on scores
  const dataPoints = TRAIT_ORDER.map((key, i) => {
    const score = scores[key];
    const radius = (score / 100) * maxRadius;
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5;
    return [
      center + radius * Math.cos(angle),
      center + radius * Math.sin(angle),
    ] as [number, number];
  });
  
  // Label positions (outside the chart)
  const labelPositions = getPolygonPoints(center, center, maxRadius + 28, 5);
  
  // Outer pentagon vertices for grid
  const outerPoints = getPolygonPoints(center, center, maxRadius, 5);
  
  const selectedMeta = selectedTrait 
    ? OCEAN_TRAITS.find(t => t.key === selectedTrait) 
    : null;
  
  return (
    <div className="flex flex-col items-center">
      {/* Chart */}
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="touch-none"
        role="img"
        aria-label={`Personality chart showing ${TRAIT_ORDER.map(k => `${OCEAN_TRAITS.find(t => t.key === k)?.label} at ${scores[k]}%`).join(", ")}`}
      >
        {/* Grid rings */}
        {gridRings.map((scale, i) => (
          <path
            key={i}
            d={pointsToPath(getPolygonPoints(center, center, maxRadius * scale, 5))}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={scale === 0.5 ? 1 : 0.5}
            strokeDasharray={scale === 0.5 ? "4 4" : undefined}
            opacity={0.5}
          />
        ))}
        
        {/* Axis lines from center to vertices */}
        {outerPoints.map((point, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={point[0]}
            y2={point[1]}
            stroke="hsl(var(--border))"
            strokeWidth={0.5}
            opacity={0.3}
          />
        ))}
        
        {/* Data polygon fill */}
        <path
          d={pointsToPath(dataPoints)}
          fill="hsl(var(--primary) / 0.15)"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          className="transition-all duration-300"
        />
        
        {/* Data points */}
        {dataPoints.map((point, i) => {
          const key = TRAIT_ORDER[i];
          const isSelected = selectedTrait === key;
          
          return (
            <g key={key}>
              {/* Tap target (larger invisible circle) */}
              <circle
                cx={point[0]}
                cy={point[1]}
                r={22}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => setSelectedTrait(isSelected ? null : key)}
              />
              {/* Visible point */}
              <circle
                cx={point[0]}
                cy={point[1]}
                r={isSelected ? 8 : 6}
                fill="hsl(var(--primary))"
                stroke="hsl(var(--background))"
                strokeWidth={2}
                className={cn(
                  "transition-all duration-200",
                  isSelected && "drop-shadow-md"
                )}
              />
              {/* Inner dot */}
              <circle
                cx={point[0]}
                cy={point[1]}
                r={2}
                fill="hsl(var(--background))"
              />
            </g>
          );
        })}
        
        {/* Labels */}
        {labelPositions.map((pos, i) => {
          const key = TRAIT_ORDER[i];
          const meta = OCEAN_TRAITS.find(t => t.key === key)!;
          const isSelected = selectedTrait === key;
          const score = scores[key];
          
          // Adjust text anchor based on position
          let textAnchor: "start" | "middle" | "end" = "middle";
          let dx = 0;
          if (i === 1) { textAnchor = "start"; dx = 4; } // Right side
          if (i === 2) { textAnchor = "start"; dx = 4; }
          if (i === 3) { textAnchor = "end"; dx = -4; } // Left side
          if (i === 4) { textAnchor = "end"; dx = -4; }
          
          return (
            <g key={key}>
              <text
                x={pos[0] + dx}
                y={pos[1]}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                className={cn(
                  "text-[11px] font-medium transition-colors cursor-pointer select-none",
                  isSelected ? "fill-primary" : "fill-muted-foreground"
                )}
                onClick={() => setSelectedTrait(isSelected ? null : key)}
              >
                {meta.label}
              </text>
              {/* Score on tap */}
              {isSelected && (
                <text
                  x={pos[0] + dx}
                  y={pos[1] + 14}
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  className="text-[10px] font-bold fill-primary animate-fade-up"
                >
                  {score}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Trait detail panel (mobile-friendly, below chart) */}
      <div className={cn(
        "w-full mt-2 overflow-hidden transition-all duration-300",
        selectedTrait ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
      )}>
        {selectedMeta && (
          <div className="p-3 rounded-xl bg-muted/50 text-center">
            <p className="text-xs font-semibold text-foreground">
              {selectedMeta.label}: {getTraitLevel(scores[selectedTrait!])}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {scores[selectedTrait!] >= 50 
                ? selectedMeta.highDescription 
                : selectedMeta.lowDescription}
            </p>
          </div>
        )}
      </div>
      
      {/* Tap hint */}
      {!selectedTrait && (
        <p className="text-[10px] text-muted-foreground mt-1">
          Tap a trait to learn more
        </p>
      )}
    </div>
  );
}
