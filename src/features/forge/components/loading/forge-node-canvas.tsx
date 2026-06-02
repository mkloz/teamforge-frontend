"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

interface ForgeNodeCanvasProps {
  progress: number;
}

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  alive: boolean;
  selected: boolean;
}

type ForgePhase = "scanning" | "narrowing" | "forming";

const TOTAL_NODES = 28;
const FINAL_NODES = 5;
const NARROWING_NODES = 14;
const EDGE_DIST = 110;

const PHASE_LABELS: Record<ForgePhase, string> = {
  forming: "Forming your group...",
  narrowing: "Finding compatible people",
  scanning: "Scanning your profile",
};

function getPhase(progress: number): ForgePhase {
  if (progress < 35) return "scanning";
  if (progress < 72) return "narrowing";
  return "forming";
}

function getAliveCount(phase: ForgePhase): number {
  if (phase === "scanning") return TOTAL_NODES;
  if (phase === "narrowing") return NARROWING_NODES;
  return FINAL_NODES;
}

export function ForgeNodeCanvas({ progress }: ForgeNodeCanvasProps) {
  const shouldReduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const phase = getPhase(progress);

  // Initialise nodes once
  useEffect(() => {
    if (shouldReduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    nodesRef.current = Array.from({ length: TOTAL_NODES }, (_, id) => ({
      alive: true,
      id,
      phase: Math.random() * Math.PI * 2,
      selected: id < FINAL_NODES,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      x: Math.random() * w,
      y: Math.random() * h,
    }));
  }, [shouldReduceMotion]);

  // Kill un-selected nodes as phase advances
  useEffect(() => {
    if (shouldReduceMotion) return;
    const nodes = nodesRef.current;
    const keep = getAliveCount(phase);
    let killed = 0;

    for (const n of nodes) {
      if (!n.selected && n.alive && killed < TOTAL_NODES - keep) {
        n.alive = false;
        killed++;
      }
    }
  }, [phase, shouldReduceMotion]);

  // Animation loop
  useEffect(() => {
    if (shouldReduceMotion) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let tick = 0;

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;
      const isForming = phase === "forming";
      const alive = nodesRef.current.filter((n) => n.alive);

      // Move nodes
      for (const n of alive) {
        if (isForming && n.selected) {
          // Converge toward center
          n.x += (cx - n.x) * 0.025;
          n.y += (cy - n.y) * 0.025;
        } else {
          n.x += n.vx + Math.sin(tick * 0.015 + n.phase) * 0.4;
          n.y += n.vy + Math.cos(tick * 0.013 + n.phase * 1.3) * 0.4;
          if (n.x < 8 || n.x > canvas.width - 8) n.vx *= -1;
          if (n.y < 8 || n.y > canvas.height - 8) n.vy *= -1;
        }
      }

      // Draw edges
      for (let i = 0; i < alive.length; i++) {
        for (let j = i + 1; j < alive.length; j++) {
          const a = alive[i];
          const b = alive[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > EDGE_DIST) continue;

          const isBothSelected = a.selected && b.selected;
          const opacity =
            (1 - dist / EDGE_DIST) * (isBothSelected ? 0.7 : 0.22);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = isBothSelected
            ? `rgba(13,148,136,${opacity})`
            : `rgba(107,114,128,${opacity * 0.6})`;
          ctx.lineWidth = isBothSelected ? 1.2 : 0.7;
          ctx.stroke();
        }
      }

      // Draw nodes
      for (const n of alive) {
        const pulse = 1 + Math.sin(tick * 0.06 + n.phase) * 0.12;
        const r = (n.selected ? 5 : 3.5) * pulse;
        const isAmberFlash = isForming && n.selected && tick % 60 < 10;

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isAmberFlash
          ? "#F59E0B"
          : n.selected
            ? "#0D9488"
            : "rgba(107,114,128,0.55)";
        ctx.fill();

        if (n.selected) {
          const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
          grd.addColorStop(
            0,
            isAmberFlash ? "rgba(245,158,11,0.35)" : "rgba(13,148,136,0.15)",
          );
          grd.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animFrameRef.current !== null)
        cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <ReducedMotionForgeLoading phase={phase} />;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col items-center justify-center gap-10 overflow-hidden bg-hero-bg">
      {/* Radial glow backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(13,148,136,0.07) 0%, transparent 70%)",
        }}
      />

      <canvas
        ref={canvasRef}
        width={480}
        height={360}
        className="max-w-full opacity-90"
        style={{ imageRendering: "crisp-edges" }}
      />

      {/* Labels */}
      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            className="font-black text-lg text-white tracking-tight"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          >
            {PHASE_LABELS[phase]}
          </motion.p>
        </AnimatePresence>

        <p className="font-bold text-micro text-white/40">Group forge</p>

        <div className="flex items-center gap-1.5 pt-1" aria-hidden="true">
          {(["teal", "teal", "amber"] as const).map((color, i) => (
            <motion.span
              key={color + String(i)}
              className={
                color === "amber"
                  ? "size-1.5 rounded-full bg-spark-amber"
                  : "size-1.5 rounded-full bg-forge-teal"
              }
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
              transition={{
                delay: i * 0.18,
                duration: 1.1,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ReducedMotionForgeLoading({ phase }: { phase: ForgePhase }) {
  return (
    <div
      role="status"
      aria-label={PHASE_LABELS[phase]}
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-hero-bg text-center"
    >
      <div className="size-12 rounded-full border-2 border-forge-teal/40 border-t-forge-teal" />
      <p className="font-black text-lg text-white">{PHASE_LABELS[phase]}</p>
      <p className="font-bold text-micro text-white/40">Group forge</p>
    </div>
  );
}
