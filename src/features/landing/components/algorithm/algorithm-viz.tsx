import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import { PHASE_LABELS } from "./algorithm-data";
import { useAlgorithmSequence } from "./use-algorithm-sequence";
import { buildNodes } from "../../lib/node-builder";
import { OrbitalRings } from "./orbital-rings";
import { AlgoLine } from "./algo-line";
import { AlgoNode } from "./algo-node";
import { DataParticles } from "./data-particles";

interface AlgorithmVizProps {
  inView: boolean;
}

export function AlgorithmViz({ inView }: AlgorithmVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(380);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setSize(Math.min(containerRef.current.offsetWidth, 420));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
        "relative flex-1 w-full max-w-md lg:max-w-none transition-[opacity,transform] duration-700 delay-200",
        inView ? "opacity-100 scale-100" : "opacity-0 scale-95",
      )}
    >
      {/* Visual background rings */}
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
        className="w-full mx-auto block overflow-visible"
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
          />
        ))}
      </svg>

      <div className="text-center mt-6 h-7">
        <motion.p
          className="font-sans text-sm"
          animate={{
            color:
              phase === "formed"
                ? "var(--color-spark-amber)"
                : "rgba(255,255,255,0.6)",
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
