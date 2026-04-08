import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { DisplayNode, Phase } from "./algorithm-types";

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

interface AlgoNodeProps {
  node: DisplayNode;
  phase: Phase;
  cx: number;
  cy: number;
  size: number;
}

export function AlgoNode({ node, phase, cx, cy, size }: AlgoNodeProps) {
  const getNodeStyle = () => {
    switch (node.type) {
      case "center":
        return {
          fill: "var(--color-forge-teal)",
          r: size * 0.055,
          textFill: "#fff",
          opacity: 1,
          glow: true,
          glowColor: "var(--color-forge-teal)",
        };
      case "selected":
        return {
          fill: "var(--color-spark-amber)",
          r: size * 0.038,
          textFill: "var(--color-ink)",
          opacity: 1,
          glow: true,
          glowColor: "var(--color-spark-amber)",
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
  };

  const ns = getNodeStyle();

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
          ease: [0.16, 1, 0.3, 1],
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
              node.type === "selected" ? "url(#amberGlow)" : "url(#centerGlow)"
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

      {node.type !== "center" && node.avatar ? (
        <>
          <defs>
            <clipPath id={`clip-${node.id}`}>
              <circle cx="0" cy="0" r={Math.max(ns.r, 0)} />
            </clipPath>
          </defs>
          <motion.circle
            cx={0}
            cy={0}
            animate={{ r: ns.r }}
            fill="#111"
            stroke={ns.fill}
            strokeWidth={node.type === "selected" ? 2 : 1}
            transition={{ duration: 0.6 }}
          />
          <image
            href={node.avatar}
            x={-ns.r}
            y={-ns.r}
            width={ns.r * 2}
            height={ns.r * 2}
            clipPath={`url(#clip-${node.id})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      ) : (
        <>
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
        </>
      )}

      {node.type !== "center" && (
        <motion.text
          x={0}
          y={ns.r + size * 0.025}
          textAnchor="middle"
          animate={{
            fill:
              node.type === "selected"
                ? "rgba(245,158,11,0.9)" // Brighter Amber
                : node.type === "rejected"
                  ? "rgba(255,255,255,0.15)" // Still faded but visible
                  : "rgba(255,255,255,0.5)", // Default state needs more contrast
          }}
          fontSize={size * 0.018}
          className="font-sans pointer-events-none"
          transition={{ duration: 0.5 }}
        >
          {node.interest}
        </motion.text>
      )}

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
                opacity: phase === "formed" && node.type === "rejected" ? 0 : 1,
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
}
