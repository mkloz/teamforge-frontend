import { useEffect, useRef, useState } from "react";
import { TeamForgeLogo } from "@/assets/logo";

interface ConvergenceAnimationProps {
  focused: boolean;
  submitted: boolean;
}

export function ConvergenceAnimation({
  focused,
  submitted,
}: ConvergenceAnimationProps) {
  const [apexVisible, setApexVisible] = useState(false);
  const [rippleVisible, setRippleVisible] = useState(false);
  const prevSubmitted = useRef(false);

  useEffect(() => {
    if (submitted && !prevSubmitted.current) {
      prevSubmitted.current = true;
      setTimeout(() => {
        setRippleVisible(true);
        setApexVisible(true);
      }, 300);
    }
    if (!submitted) {
      prevSubmitted.current = false;
      setApexVisible(false);
      setRippleVisible(false);
    }
  }, [submitted]);

  // Polygon definitions mirror the logo's Voronoi quadrants,
  // scaled to fill a 600x700 viewport for cinematic presence.
  // Each polygon corresponds to one "group member" archetype.
  const polygons = [
    {
      // Top-right — highest opacity, most prominent member
      points: "300,340 200,-60 700,-60 700,250",
      opacity: 1.0,
      breatheClass: "animate-voronoi-a",
      convergeStyle: focused
        ? {
            animation:
              "voronoi-converge-a 1.8s ease-in-out infinite alternate",
          }
        : undefined,
    },
    {
      // Bottom-right
      points: "300,340 700,250 700,700 420,700",
      opacity: 0.66,
      breatheClass: "animate-voronoi-b",
      convergeStyle: focused
        ? {
            animation:
              "voronoi-converge-b 1.8s ease-in-out infinite alternate",
          }
        : undefined,
    },
    {
      // Bottom-left
      points: "300,340 420,700 -100,700 -100,440",
      opacity: 0.83,
      breatheClass: "animate-voronoi-c",
      convergeStyle: focused
        ? {
            animation:
              "voronoi-converge-c 1.8s ease-in-out infinite alternate",
          }
        : undefined,
    },
    {
      // Top-left — lowest opacity, background presence
      points: "300,340 -100,440 -100,-60 200,-60",
      opacity: 0.5,
      breatheClass: "animate-voronoi-d",
      convergeStyle: focused
        ? {
            animation:
              "voronoi-converge-d 1.8s ease-in-out infinite alternate",
          }
        : undefined,
    },
  ];

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: "#090909" }}
      aria-hidden="true"
    >
      {/* Subtle radial vignette to add depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(9,9,9,0.7) 100%)",
          zIndex: 2,
        }}
      />

      {/* SVG Voronoi Convergence */}
      <svg
        viewBox="0 0 600 700"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      >
        <defs>
          <filter id="auth-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="auth-glow-amber"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Voronoi region polygons */}
        {polygons.map((poly, i) => (
          <polygon
            key={i}
            points={poly.points}
            fill="#0D9488"
            fillOpacity={poly.opacity}
            stroke="#090909"
            strokeWidth="6"
            strokeLinejoin="round"
            filter="url(#auth-glow)"
            className={!focused ? poly.breatheClass : undefined}
            style={{
              transformOrigin: "300px 340px",
              transition: "opacity 0.8s ease",
              ...poly.convergeStyle,
            }}
          />
        ))}

        {/* Apex ripple — fires on submit */}
        {rippleVisible && (
          <circle
            cx="300"
            cy="340"
            r="16"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeOpacity="0.8"
            style={{
              transformOrigin: "300px 340px",
              animation: "apex-ripple 0.9s ease-out forwards",
            }}
          />
        )}
        {rippleVisible && (
          <circle
            cx="300"
            cy="340"
            r="16"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1"
            strokeOpacity="0.4"
            style={{
              transformOrigin: "300px 340px",
              animation: "apex-ripple 1.1s 0.15s ease-out forwards",
            }}
          />
        )}

        {/* Apex dot — the convergence point, always present but grows on submit */}
        <circle
          cx="300"
          cy="340"
          r={apexVisible ? 14 : 9}
          fill="#F59E0B"
          stroke="#090909"
          strokeWidth="3"
          filter={apexVisible ? "url(#auth-glow-amber)" : undefined}
          style={{
            transformOrigin: "300px 340px",
            transition: "r 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            animation: apexVisible ? "apex-burst 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards" : undefined,
          }}
        />
      </svg>

      {/* Brand wordmark — bottom-left corner, subtle */}
      <div
        className="absolute bottom-8 left-8 flex items-center gap-2.5"
        style={{ zIndex: 3 }}
      >
        <TeamForgeLogo className="w-7 h-7" showBackground={false} />
        <span className="font-sans text-sm font-semibold">
          <span className="text-white/50">Team</span>
          <span style={{ color: "#0D9488" }}>Forge</span>
        </span>
      </div>

      {/* Contextual label — shifts with state */}
      <div
        className="absolute top-10 left-0 right-0 flex flex-col items-center"
        style={{ zIndex: 3 }}
      >
        <p
          className="font-sans text-xs font-semibold uppercase tracking-widest"
          style={{
            color: "#0D9488",
            opacity: 0.7,
            transition: "opacity 0.5s ease",
          }}
        >
          {submitted
            ? "Forging your group..."
            : focused
              ? "Finding your people..."
              : "Your group awaits"}
        </p>
      </div>
    </div>
  );
}
