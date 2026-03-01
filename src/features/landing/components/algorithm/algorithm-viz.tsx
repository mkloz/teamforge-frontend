import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { CANDIDATES, PHASE_LABELS, SELECTED_IDS } from "./algorithm-data";
import type { AlgoNode, Phase } from "./algorithm-types";

// Setup DisplayNode with scores
export interface DisplayNode extends AlgoNode {
  finalScore: number;
  displayScore: number;
}

function buildNodes(cx: number, cy: number, radius: number): DisplayNode[] {
  const nodes: DisplayNode[] = [
    {
      id: 0,
      x: cx,
      y: cy,
      label: "You",
      type: "center",
      interest: "",
      angle: 0,
      finalScore: 100,
      displayScore: 100,
    },
  ];
  CANDIDATES.forEach((d, i) => {
    const angle = (i / CANDIDATES.length) * Math.PI * 2 - Math.PI / 2;
    const isSelected = SELECTED_IDS.has(i + 1);
    const finalScore = isSelected
      ? Math.floor(Math.random() * 10) + 90
      : Math.floor(Math.random() * 40) + 10;
    nodes.push({
      id: i + 1,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      label: d.mbti,
      type: "candidate",
      interest: d.interest,
      angle,
      finalScore,
      displayScore: 0,
    });
  });
  return nodes;
}

function MatchScoreDisplay({
  node,
  phase,
}: {
  node: DisplayNode;
  phase: Phase;
}) {
  const [randomScore, setRandomScore] = useState(node.displayScore);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (phase === "evaluating") {
      interval = setInterval(() => {
        setRandomScore(Math.floor(Math.random() * 99));
      }, 50);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase]);

  let displayScore = 0;
  if (phase === "evaluating") {
    displayScore = randomScore;
  } else if (phase === "selecting" || phase === "formed") {
    displayScore = node.finalScore;
  }

  return <>{displayScore}%</>;
}

interface AlgorithmVizProps {
  inView: boolean;
}

const PARTICLE_RANDOMS = (() => {
  const map = new Map<number, { duration: number; delay: number }>();
  for (let i = 1; i <= 20; i++) {
    // Deterministic pseudo-random values based on ID to avoid impure Math.random during render
    const r1 = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const r2 = (Math.sin(i * 78.233) * 43758.5453) % 1;
    const val1 = Math.abs(r1);
    const val2 = Math.abs(r2);

    map.set(i, {
      duration: 0.6 + val1 * 0.6,
      delay: val2 * 0.5,
    });
  }
  return map;
})();

export function AlgorithmViz({ inView }: AlgorithmVizProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [nodes, setNodes] = useState<DisplayNode[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(380);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setSize(Math.min(w, 420));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.36;

    const frame = requestAnimationFrame(() => {
      setNodes(buildNodes(cx, cy, r));
    });
    return () => cancelAnimationFrame(frame);
  }, [size]);

  useEffect(() => {
    if (!inView) {
      const f = requestAnimationFrame(() => setPhase("idle"));
      return () => cancelAnimationFrame(f);
    }
    if (nodes.length === 0) return;

    let isCancelled = false;
    let t1: ReturnType<typeof setTimeout>,
      t2: ReturnType<typeof setTimeout>,
      t3: ReturnType<typeof setTimeout>,
      t4: ReturnType<typeof setTimeout>,
      t5: ReturnType<typeof setTimeout>,
      t6: ReturnType<typeof setTimeout>;
    let frame: number;

    const runSequence = () => {
      if (isCancelled) return;

      // Reset nodes for new cycle
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          type: n.id === 0 ? "center" : "candidate",
          displayScore: n.id === 0 ? 100 : 0,
        })),
      );

      frame = requestAnimationFrame(() => setPhase("scanning"));

      // longer scanning phase
      t1 = setTimeout(() => {
        if (!isCancelled) setPhase("evaluating");
      }, 2000);

      // longer evaluating phase
      t2 = setTimeout(() => {
        if (!isCancelled) setPhase("selecting");
      }, 5500);

      // slightly longer delay before moving nodes
      t3 = setTimeout(() => {
        if (!isCancelled) {
          setNodes((prev) =>
            prev.map((n) =>
              n.type === "candidate"
                ? {
                    ...n,
                    type: SELECTED_IDS.has(n.id) ? "selected" : "rejected",
                  }
                : n,
            ),
          );
        }
      }, 5900);

      // extra time to form group
      t4 = setTimeout(() => {
        if (!isCancelled) setPhase("formed");
      }, 7500);

      // wait at the end, then reset to idle, then restart
      t5 = setTimeout(() => {
        if (!isCancelled) {
          setPhase("idle");
          t6 = setTimeout(() => {
            if (!isCancelled) runSequence();
          }, 1500); // pause in idle before looping
        }
      }, 12000); // stay in "formed" state for 4.5s
    };

    const initialDelay = setTimeout(() => {
      if (!isCancelled) runSequence();
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(initialDelay);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      cancelAnimationFrame(frame);
    };
  }, [inView, nodes.length]);

  const getNodeStyle = useCallback(
    (node: DisplayNode) => {
      switch (node.type) {
        case "center":
          return {
            fill: "#0D9488",
            r: size * 0.055,
            textFill: "#fff",
            opacity: 1,
            glow: true,
            glowColor: "#0D9488",
          };
        case "selected":
          return {
            fill: "#F59E0B",
            r: size * 0.038,
            textFill: "#1C1C1A",
            opacity: 1,
            glow: true,
            glowColor: "#F59E0B",
          };
        case "rejected":
          return {
            fill: "#1f2937",
            r: size * 0.025,
            textFill: "#4b5563",
            opacity: 0.15,
            glow: false,
            glowColor: "",
          };
        default:
          return {
            fill: "#0D9488",
            r: size * 0.032,
            textFill: "#fff",
            opacity: phase === "idle" ? 0 : 0.8,
            glow: false,
            glowColor: "",
          };
      }
    },
    [phase, size],
  );

  const getLineProps = useCallback(
    (node: DisplayNode) => {
      if (phase === "idle")
        return { opacity: 0, stroke: "#0D9488", width: 0.8 };
      if (node.type === "rejected")
        return { opacity: 0.02, stroke: "#374151", width: 0.5 };
      if (node.type === "selected")
        return { opacity: 0.65, stroke: "#F59E0B", width: 1.8 };
      if (phase === "scanning")
        return { opacity: 0.15, stroke: "#0D9488", width: 0.8 };
      return { opacity: 0.15, stroke: "#0D9488", width: 0.8 };
    },
    [phase],
  );

  const cx = size / 2;
  const cy = size / 2;
  const selectedNodes = nodes.filter((n) => n.type === "selected");

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex-1 w-full max-w-md lg:max-w-none transition-all duration-700 delay-200",
        inView ? "opacity-100 scale-100" : "opacity-0 scale-95",
      )}
    >
      <div
        className="absolute inset-0 m-auto rounded-full pointer-events-none border border-forge-teal/10"
        aria-hidden="true"
        style={{ width: size * 0.78, height: size * 0.78 }}
      />
      <div
        className="absolute inset-0 m-auto rounded-full pointer-events-none border border-dashed border-forge-teal/5"
        aria-hidden="true"
        style={{ width: size * 0.56, height: size * 0.56 }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full mx-auto block"
        aria-label="Interactive algorithm visualization showing group formation"
        role="img"
      >
        <defs>
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="amberGlow">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={size * 0.18} fill="url(#centerGlow)" />

        {/* Outer Orbital Rings */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={size * 0.45}
          fill="none"
          stroke="#0D9488"
          strokeWidth="1"
          opacity="0.1"
          strokeDasharray="4 12"
          animate={{ rotate: 360 }}
          style={{ originX: cx, originY: cy }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={size * 0.4}
          fill="none"
          stroke="#14B8A6"
          strokeWidth="0.5"
          opacity="0.15"
          strokeDasharray="2 6"
          animate={{ rotate: -360 }}
          style={{ originX: cx, originY: cy }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />

        {/* Core Sonar Pulse */}
        <AnimatePresence>
          {(phase === "idle" ||
            phase === "scanning" ||
            phase === "evaluating") && (
            <motion.circle
              cx={cx}
              cy={cy}
              fill="none"
              stroke="#0D9488"
              strokeWidth="1"
              initial={{ r: size * 0.05, opacity: 0.6 }}
              animate={{ r: size * 0.48, opacity: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* Scanning Target Ring */}
        <AnimatePresence>
          {(phase === "scanning" || phase === "evaluating") && (
            <motion.circle
              cx={cx}
              cy={cy}
              r={size * 0.36}
              fill="none"
              stroke="#0D9488"
              strokeWidth="1"
              opacity="0.3"
              strokeDasharray="6 8"
              animate={{ rotate: 360, opacity: 0.3 }}
              exit={{ opacity: 0, r: size * 0.4 }}
              style={{ originX: cx, originY: cy }}
              transition={{
                rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                opacity: { duration: 0.2 },
              }}
            />
          )}
        </AnimatePresence>

        {/* Connecting Lines */}
        {nodes.map((node) => {
          if (node.type === "center") return null;
          const lp = getLineProps(node);

          let targetRadius = size * 0.36;
          if (phase === "selecting" || phase === "formed") {
            if (node.type === "selected") targetRadius = size * 0.22;
            else if (node.type === "rejected") targetRadius = size * 0.48;
          }
          const targetX = cx + Math.cos(node.angle) * targetRadius;
          const targetY = cy + Math.sin(node.angle) * targetRadius;

          return (
            <motion.line
              key={`line-${node.id}`}
              initial={{ x1: cx, y1: cy, x2: cx, y2: cy }}
              animate={{
                x1: cx,
                y1: cy,
                x2: targetX,
                y2: targetY,
                opacity: lp.opacity,
                stroke: lp.stroke,
                strokeWidth: lp.width,
              }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1 + node.id * 0.04,
              }}
            />
          );
        })}

        {/* Cross Connections for Final Team */}
        {selectedNodes.length > 1 &&
          selectedNodes.map((a, i) =>
            selectedNodes.slice(i + 1).map((b) => {
              const rA = size * 0.22;
              const rB = size * 0.22;
              const xA = cx + Math.cos(a.angle) * rA;
              const yA = cy + Math.sin(a.angle) * rA;
              const xB = cx + Math.cos(b.angle) * rB;
              const yB = cy + Math.sin(b.angle) * rB;

              return (
                <motion.line
                  key={`cross-${a.id}-${b.id}`}
                  initial={{ x1: xA, y1: yA, x2: xA, y2: yA, opacity: 0 }}
                  animate={{
                    x1: xA,
                    y1: yA,
                    x2: xB,
                    y2: yB,
                    opacity: phase === "formed" ? 0.45 : 0,
                  }}
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              );
            }),
          )}

        {/* Data Flow Particles */}
        <AnimatePresence>
          {phase === "evaluating" &&
            nodes
              .filter((n) => n.type !== "center" && n.type !== "rejected")
              .map((node) => {
                const targetRadius = size * 0.36;
                const targetX = cx + Math.cos(node.angle) * targetRadius;
                const targetY = cy + Math.sin(node.angle) * targetRadius;

                const pr = PARTICLE_RANDOMS.get(node.id) || {
                  duration: 0.9,
                  delay: 0.2,
                };
                return (
                  <motion.circle
                    key={`particle-${node.id}`}
                    r={size * 0.008}
                    fill="#FFF"
                    initial={{ cx, cy, opacity: 0 }}
                    animate={{ cx: targetX, cy: targetY, opacity: [0, 1, 0] }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{
                      duration: pr.duration,
                      repeat: Infinity,
                      ease: "linear",
                      delay: pr.delay,
                    }}
                    className="drop-shadow-[0_0_4px_#14B8A6]"
                  />
                );
              })}
        </AnimatePresence>

        {/* Nodes and Labels */}
        {nodes.map((node) => {
          const ns = getNodeStyle(node);

          let targetRadius = size * 0.36;
          if (phase === "selecting" || phase === "formed") {
            if (node.type === "selected") targetRadius = size * 0.22;
            else if (node.type === "rejected") targetRadius = size * 0.48;
          }
          if (node.type === "center") targetRadius = 0;

          const targetX =
            targetRadius === 0 ? cx : cx + Math.cos(node.angle) * targetRadius;
          const targetY =
            targetRadius === 0 ? cy : cy + Math.sin(node.angle) * targetRadius;

          return (
            <motion.g
              key={node.id}
              initial={{ x: cx, y: cy, opacity: 0, scale: 0 }}
              animate={{
                x: targetX,
                y: targetY,
                opacity: ns.opacity,
                scale: phase === "idle" ? 0 : 1,
              }}
              transition={{
                x: {
                  duration: node.type === "center" ? 0.5 : 1.2,
                  ease: [0.16, 1, 0.3, 1], // Custom fast-out slow-in
                },
                y: {
                  duration: node.type === "center" ? 0.5 : 1.2,
                  ease: [0.16, 1, 0.3, 1],
                },
                opacity: { duration: 0.5 },
                scale: {
                  duration: 0.6,
                  delay: node.type === "center" ? 0 : 0.1 + node.id * 0.04,
                },
              }}
            >
              {ns.glow && (
                <>
                  <motion.circle
                    cx={0}
                    cy={0}
                    r={ns.r * 2.8}
                    fill={
                      node.type === "selected"
                        ? "url(#amberGlow)"
                        : "url(#centerGlow)"
                    }
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                  />
                  <motion.circle
                    cx={0}
                    cy={0}
                    r={ns.r * 1.6}
                    fill={ns.glowColor}
                    opacity={0.15}
                    filter="url(#softBlur)"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.15 }}
                    transition={{ duration: 1 }}
                  />
                </>
              )}

              <motion.circle
                cx={0}
                cy={0}
                animate={{ r: ns.r, fill: ns.fill }}
                transition={{ duration: 0.6 }}
              />

              <motion.text
                x={0}
                y={0.5}
                textAnchor="middle"
                dominantBaseline="central"
                animate={{ fill: ns.textFill }}
                fontSize={node.type === "center" ? size * 0.028 : size * 0.02}
                fontWeight="700"
                fontFamily="Inter, sans-serif"
                className="pointer-events-none"
              >
                {node.label}
              </motion.text>

              {node.type !== "center" && (
                <motion.text
                  x={0}
                  y={ns.r + size * 0.025}
                  textAnchor="middle"
                  animate={{
                    fill:
                      node.type === "selected"
                        ? "rgba(245,158,11,0.65)"
                        : node.type === "rejected"
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(255,255,255,0.25)",
                  }}
                  fontSize={size * 0.018}
                  className="font-sans pointer-events-none"
                  transition={{ duration: 0.5 }}
                >
                  {node.interest}
                </motion.text>
              )}

              {/* Match Percentage HUD */}
              <AnimatePresence>
                {node.type !== "center" &&
                  (phase === "evaluating" ||
                    phase === "selecting" ||
                    phase === "formed") && (
                    <motion.text
                      x={0}
                      y={-(ns.r + size * 0.02)}
                      textAnchor="middle"
                      fill={
                        node.type === "selected" && phase !== "evaluating"
                          ? "#F59E0B"
                          : "rgba(20, 184, 166, 0.8)"
                      }
                      fontSize={size * 0.016}
                      className="font-mono font-bold tracking-wider pointer-events-none"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{
                        opacity:
                          phase === "formed" && node.type === "rejected"
                            ? 0
                            : 1,
                        y: 0,
                      }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MatchScoreDisplay node={node} phase={phase} />
                    </motion.text>
                  )}
              </AnimatePresence>
            </motion.g>
          );
        })}
      </svg>

      <div className="text-center mt-6 h-7">
        <motion.p
          className="font-sans text-sm"
          animate={{
            color: phase === "formed" ? "#F59E0B" : "rgba(255,255,255,0.4)",
            fontWeight: phase === "formed" ? 600 : 400,
            textShadow:
              phase === "formed" ? "0 0 10px rgba(245,158,11,0.5)" : "none",
          }}
          transition={{ duration: 0.7 }}
        >
          {PHASE_LABELS[phase]}
        </motion.p>
      </div>
    </div>
  );
}
