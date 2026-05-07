import { buildNodes } from "@/features/landing/lib/node-builder";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { PHASE_LABELS } from "@/features/landing/components/algorithm/algorithm-data";
import { AlgoLine } from "./algo-line";
import { AlgoNode } from "./algo-node";
import { DataParticles } from "./data-particles";
import { OrbitalRings } from "./orbital-rings";
import { useAlgorithmSequence } from "./use-algorithm-sequence";
import { useAlgorithmVizSize } from "./use-algorithm-viz-size";

interface AlgorithmVizProps {
  inView: boolean;
}

export function AlgorithmViz({ inView }: AlgorithmVizProps) {
  const { containerRef, size } = useAlgorithmVizSize();
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;

  const initialNodes = useMemo(() => buildNodes(cx, cy, r), [cx, cy, r]);
  const { phase, nodes } = useAlgorithmSequence(inView, initialNodes);

  const selectedNodes = nodes.filter((n) => n.type === "selected");

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full max-w-md flex-1 transition-[opacity,transform] delay-200 duration-700 lg:max-w-none",
        inView ? "scale-100 opacity-100" : "scale-95 opacity-0",
      )}
    >
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        {/* Visual background rings */}
        <div
          className="pointer-events-none absolute inset-0 m-auto rounded-full border border-forge-teal/10"
          aria-hidden="true"
          style={{ width: size * 0.78, height: size * 0.78 }}
        />
        <div
          className="pointer-events-none absolute inset-0 m-auto rounded-full border border-dashed border-forge-teal/5"
          aria-hidden="true"
          style={{ width: size * 0.56, height: size * 0.56 }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="block overflow-visible"
          aria-label="Interactive algorithm visualization showing group formation"
          role="img"
        >
          <defs>
            <radialGradient id="centerGlow">
              <stop
                offset="0%"
                stopColor="var(--color-forge-teal)"
                stopOpacity="0.4"
              />
              <stop
                offset="100%"
                stopColor="var(--color-forge-teal)"
                stopOpacity="0"
              />
            </radialGradient>
            <radialGradient id="amberGlow">
              <stop
                offset="0%"
                stopColor="var(--color-spark-amber)"
                stopOpacity="0.4"
              />
              <stop
                offset="100%"
                stopColor="var(--color-spark-amber)"
                stopOpacity="0"
              />
            </radialGradient>
            <filter id="softBlur">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          <circle cx={cx} cy={cy} r={size * 0.18} fill="url(#centerGlow)" />

          <OrbitalRings cx={cx} cy={cy} size={size} />

          {/* Core Sonar Pulse */}
          <AnimatePresence>
            {(phase === "idle" ||
              phase === "scanning" ||
              phase === "evaluating") && (
              <motion.circle
                cx={cx}
                cy={cy}
                fill="none"
                stroke="var(--color-forge-teal)"
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
                stroke="var(--color-forge-teal)"
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
          {nodes.map((node) => (
            <AlgoLine
              key={`line-${node.id}`}
              node={node}
              phase={phase}
              cx={cx}
              cy={cy}
              size={size}
            />
          ))}

          {/* Cross Connections for Final Team */}
          {selectedNodes.length > 1 &&
            selectedNodes.map((a, i) =>
              selectedNodes.slice(i + 1).map((b) => (
                <motion.line
                  key={`cross-${a.id}-${b.id}`}
                  initial={{ opacity: 0 }}
                  animate={{
                    x1: cx + Math.cos(a.angle) * size * 0.22,
                    y1: cy + Math.sin(a.angle) * size * 0.22,
                    x2: cx + Math.cos(b.angle) * size * 0.22,
                    y2: cy + Math.sin(b.angle) * size * 0.22,
                    opacity: phase === "formed" ? 0.45 : 0,
                  }}
                  stroke="var(--color-spark-amber)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              )),
            )}

          <DataParticles
            nodes={nodes}
            phase={phase}
            cx={cx}
            cy={cy}
            size={size}
          />

          {/* Nodes and Labels */}
          {nodes.map((node) => (
            <AlgoNode
              key={node.id}
              node={node}
              phase={phase}
              cx={cx}
              cy={cy}
              size={size}
              isHovered={hoveredNodeId === node.id}
              onHover={setHoveredNodeId}
            />
          ))}
        </svg>
      </div>

      <div className="mt-6 h-7 overflow-hidden text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "font-sans text-sm",
              phase === "formed"
                ? "font-semibold text-spark-amber [text-shadow:0_0_10px_rgba(245,158,11,0.5)]"
                : "text-text-dark-secondary",
            )}
          >
            {PHASE_LABELS[phase]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
