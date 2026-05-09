import { type MotionValue, motion, useTransform } from "framer-motion";
import { LogoSegment } from "./logo-segment";
import { PsychometricMarker } from "./psychometric-marker";
import { PulsingRing } from "./pulsing-ring";
import { SocialConnectionLine } from "./social-connection-line";

interface VoronoiLogoProps {
  smoothProgress: MotionValue<number>;
  logoScale: MotionValue<number>;
  tiltX: MotionValue<number>;
  tiltY: MotionValue<number>;
  shouldReduceMotion: boolean;
}

export function VoronoiLogo({
  smoothProgress,
  logoScale,
  tiltX,
  tiltY,
  shouldReduceMotion,
}: VoronoiLogoProps) {
  const coreOpacity = useTransform(
    smoothProgress,
    [0, 0.05, 0.65, 0.75],
    [0, 1, 1, 0],
  );
  const coreScale = useTransform(
    smoothProgress,
    [0, 0.1, 0.25, 0.4],
    [0.8, 1, 1.1, 1],
  );
  const coreBoxShadow = useTransform(
    smoothProgress,
    [0.55, 0.75],
    ["0 0 20px rgba(13,148,136,0.2)", "0 0 60px rgba(13,148,136,0.5)"],
  );

  const radarOpacity = useTransform(
    smoothProgress,
    [0.25, 0.3, 0.5, 0.55],
    [0, 1, 1, 0],
  );
  const radarRotate = useTransform(
    smoothProgress,
    [0.25, 0.5],
    shouldReduceMotion ? [0, 0] : [0, 360],
  );

  const radarPulseOpacity = useTransform(
    smoothProgress,
    [0.25, 0.3, 0.5, 0.55],
    [0, 1, 1, 0],
  );

  const svgOpacity = useTransform(smoothProgress, [0.5, 0.6], [0, 1]);
  const apexScale = useTransform(smoothProgress, [0.82, 0.85], [0, 1]);
  const apexOpacity = useTransform(smoothProgress, [0.82, 0.84], [0, 1]);

  return (
    <motion.div
      style={{
        scale: logoScale,
        rotateX: tiltX,
        rotateY: tiltY,
        transformStyle: "preserve-3d",
      }}
      className="relative flex size-72 items-center justify-center md:h-96 md:w-96"
      role="img"
      aria-label="Interactive visualization showing TeamForge's group formation process"
    >
      {/* Phase 1: The User Core (Deep Pulse) */}
      <motion.div
        style={{
          opacity: coreOpacity,
          scale: coreScale,
        }}
        className="absolute z-10 flex size-32 items-center justify-center rounded-full border-2 border-forge-teal/20 bg-forge-teal/5 p-6 md:h-48 md:w-48"
      >
        {/* Pulsing rings for Phase 1 */}
        {!shouldReduceMotion &&
          [1, 2].map((i) => (
            <PulsingRing key={i} index={i} smoothProgress={smoothProgress} />
          ))}

        <motion.div
          animate={shouldReduceMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            boxShadow: coreBoxShadow,
          }}
          className="flex size-full items-center justify-center rounded-full bg-forge-teal text-white"
        >
          <span className="font-bold font-sans text-sm uppercase tracking-widest">
            You
          </span>
        </motion.div>
      </motion.div>

      {/* Phase 2: Intent Radar (Enhanced Scan) */}
      <motion.div
        style={{
          opacity: radarOpacity,
          rotate: radarRotate,
        }}
        className="pointer-events-none absolute size-64 md:h-96 md:w-96"
      >
        <div className="absolute top-0 left-1/2 h-1/2 w-4 -translate-x-1/2 bg-linear-to-t from-transparent via-spark-amber/10 to-spark-amber/40 blur-xl md:w-8" />
        <div className="absolute top-0 left-1/2 h-1/2 w-0.5 -translate-x-1/2 bg-spark-amber blur-sm" />
      </motion.div>

      {!shouldReduceMotion && (
        <motion.div
          style={{
            opacity: radarPulseOpacity,
          }}
          animate={{ scale: [0.5, 2], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          className="absolute size-64 rounded-full border-2 border-spark-amber/20 md:h-96 md:w-96"
        />
      )}

      {/* Orbiting psychometric markers (Phase 1) */}
      {[0, 72, 144, 216, 288].map((angle) => (
        <PsychometricMarker
          key={`marker-${angle}`}
          angle={angle}
          smoothProgress={smoothProgress}
          shouldReduceMotion={shouldReduceMotion}
        />
      ))}

      {/* Phase 3: Social Graph Connections (Step 3) */}
      <svg
        className="pointer-events-none absolute inset-0 z-0 size-full"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        {[
          { x: 80, y: 20 },
          { x: 80, y: 80 },
          { x: 20, y: 80 },
          { x: 20, y: 20 },
        ].map((point) => (
          <SocialConnectionLine
            key={`line-${point.x}-${point.y}`}
            x2={point.x}
            y2={point.y}
            smoothProgress={smoothProgress}
          />
        ))}
      </svg>

      {/* SVG Logo Morphing (Phase 3-4) */}
      <motion.svg
        viewBox="0 0 120 120"
        fill="none"
        style={{
          opacity: svgOpacity,
        }}
        className="voronoi-logo-glow size-full"
      >
        <defs>
          <clipPath id="group-boundary-hiw">
            <rect x="16" y="16" width="88" height="88" rx="12" />
          </clipPath>
        </defs>
        <g clipPath="url(#group-boundary-hiw)">
          <g stroke="#FAFAF8" strokeWidth="2" strokeLinejoin="round">
            <LogoSegment
              points="52,68 130,50 130,130 70,130"
              fillOpacity="0.66"
              smoothProgress={smoothProgress}
              shouldReduceMotion={shouldReduceMotion}
              xRange={[150, 60, 0]}
              yRange={[150, 60, 0]}
              rotateRange={[45, 0]}
            />
            <LogoSegment
              points="52,68 40,-10 130,-10 130,50"
              fillOpacity="1.0"
              smoothProgress={smoothProgress}
              shouldReduceMotion={shouldReduceMotion}
              xRange={[150, 60, 0]}
              yRange={[-150, -60, 0]}
              rotateRange={[-45, 0]}
            />
            <LogoSegment
              points="52,68 70,130 -10,130 -10,80"
              fillOpacity="0.83"
              smoothProgress={smoothProgress}
              shouldReduceMotion={shouldReduceMotion}
              xRange={[-150, -60, 0]}
              yRange={[150, 60, 0]}
              rotateRange={[-90, 0]}
            />
            <LogoSegment
              points="52,68 -10,80 -10,-10 40,-10"
              fillOpacity="0.50"
              smoothProgress={smoothProgress}
              shouldReduceMotion={shouldReduceMotion}
              xRange={[-150, -60, 0]}
              yRange={[-150, -60, 0]}
              rotateRange={[90, 0]}
            />
          </g>
        </g>

        <motion.circle
          cx="52"
          cy="68"
          r="8"
          fill="var(--color-spark-amber)"
          stroke="#FAFAF8"
          strokeWidth="2.5"
          style={{
            scale: apexScale,
            opacity: apexOpacity,
          }}
        />
      </motion.svg>
    </motion.div>
  );
}
