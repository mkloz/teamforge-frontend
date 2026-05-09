import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type {
  DisplayNode,
  Phase,
} from "@/features/landing/components/algorithm/algorithm-types";
import { Avatar } from "@/shared/components/common/avatar";

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
  isHovered: boolean;
  onHover: (id: number | null) => void;
}

export function AlgoNode({
  node,
  phase,
  cx,
  cy,
  size,
  isHovered,
  onHover,
}: AlgoNodeProps) {
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
          r: isHovered ? size * 0.045 : size * 0.038,
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
          opacity: isHovered ? 0.6 : 0.15,
          glow: false,
          glowColor: "",
        };
      default:
        return {
          fill: "#0D9488",
          r: isHovered ? size * 0.04 : size * 0.032,
          textFill: "#fff",
          opacity: phase === "idle" ? 0 : 0.8,
          glow: isHovered,
          glowColor: "var(--color-forge-teal)",
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
      onMouseEnter={() => node.type !== "center" && onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      className={node.type === "center" ? "" : "cursor-pointer"}
      initial={{ x: cx, y: cy, opacity: 0, scale: 0 }}
      animate={{
        x: targetX,
        y: targetY,
        opacity: ns.opacity,
        scale: phase === "idle" ? 0 : isHovered ? 1.2 : 1,
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
          type: "spring",
          stiffness: 300,
          damping: 20,
        },
      }}
    >
      {(ns.glow || isHovered) && (
        <>
          <motion.circle
            cx={0}
            cy={0}
            r={ns.r * 2.8}
            fill={
              node.type === "selected" ? "url(#amberGlow)" : "url(#centerGlow)"
            }
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1.5 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.circle
            cx={0}
            cy={0}
            r={ns.r * 1.6}
            fill={ns.glowColor || "var(--color-forge-teal)"}
            opacity={0.15}
            filter="url(#softBlur)"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.25 }}
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
            fill="var(--color-forge-deep-surface)"
            stroke={ns.fill}
            strokeWidth={node.type === "selected" || isHovered ? 2.5 : 1}
            transition={{ duration: 0.4 }}
          />
          <foreignObject
            x={-ns.r}
            y={-ns.r}
            width={ns.r * 2}
            height={ns.r * 2}
            clipPath={`url(#clip-${node.id})`}
          >
            <Avatar
              src={node.avatar}
              name={node.label}
              className="size-full bg-forge-deep-surface"
              loading="lazy"
            />
          </foreignObject>
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

      {node.type !== "center" && !isHovered && (
        <motion.text
          x={0}
          y={ns.r + size * (node.type === "selected" ? 0.001 : 0.003)}
          textAnchor="middle"
          animate={{
            fill:
              node.type === "selected"
                ? "rgba(245,158,11,0.9)"
                : node.type === "rejected"
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(255,255,255,0.5)",
            opacity: 0.8,
            y: ns.r + size * (node.type === "selected" ? 0.001 : 0.003),
          }}
          fontSize={size * 0.018}
          className="pointer-events-none font-sans"
          transition={{ duration: 0.3 }}
        >
          {node.tag}
        </motion.text>
      )}

      <AnimatePresence>
        {node.type !== "center" &&
          !isHovered &&
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
              className="pointer-events-none font-bold font-mono tracking-wider"
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
