"use client";

/**
 * Forge Loading — Anvil Strike (Concept A)
 *
 * Single-canvas, infinite hammer-strike animation.
 * All geometry (hammer, anvil, sparks, glow) is drawn in one RAF loop.
 *
 * Hammer mechanics
 * ─────────────────
 * The pivot is fixed at the top-centre of the canvas.  A "pendulum" arm
 * swings from rest angle (~–55°) through to impact angle (~+15°).
 * The hammer HEAD is drawn at the end of the arm so its face lands exactly
 * on the anvil top surface — no positional offset guesswork.
 *
 * Cycle (1 400 ms)
 *   0 ms  – wind-up begins  (ease-in swing to back angle)
 * 300 ms  – swing-down      (fast ease-out to impact angle)
 * 420 ms  – impact          (sparks burst, brief shudder)
 * 550 ms  – rebound         (ease back to midpoint)
 * 700 ms  – rest pause
 */

import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";

// ─── types ────────────────────────────────────────────────────────────────────

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;   // 1 → 0
  size: number;
  hue: number;    // 20–55 amber-orange range
}

interface ForgeLoadingAnvilProps {
  label?: string;
  className?: string;
}

// ─── constants ────────────────────────────────────────────────────────────────

const CYCLE_MS      = 1_400;
const IMPACT_AT     = 0.30;  // fraction of cycle when hammer hits
const REBOUND_END   = 0.42;
const REST_END      = 1.00;

// Arm geometry (canvas units, W = H = 220)
const ARM_LEN       = 88;    // pivot → hammer face centre
const HEAD_W        = 32;    // hammer head width
const HEAD_H        = 22;    // hammer head height
const HANDLE_W      = 7;
const HANDLE_H      = 50;

// Anvil geometry (centred horizontally)
const ANVIL_TOP_Y   = 158;   // canvas y of anvil top surface
const ANVIL_W       = 68;
const ANVIL_H_TOP   = 16;    // tall top block
const ANVIL_WAIST_W = 32;
const ANVIL_WAIST_H = 8;
const ANVIL_BASE_W  = 52;
const ANVIL_BASE_H  = 10;

// Angles (radians): negative = left/back, positive = right/forward
const ANGLE_REST    = -0.95;  // wound-up (back-swing)
const ANGLE_IMPACT  = 0.26;   // face flush on anvil
const ANGLE_REBOUND = -0.18;  // slight bounce-back

// ─── easing ───────────────────────────────────────────────────────────────────

function easeInCubic(t: number) { return t * t * t; }
function easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4); }
function easeOutBack(t: number, s = 1.4) {
  const c1 = s;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// ─── component ────────────────────────────────────────────────────────────────

export function ForgeLoadingAnvil({
  label = "Forging your group...",
  className,
}: ForgeLoadingAnvilProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const frameRef    = useRef<number>(0);
  const startRef    = useRef<number | null>(null);
  const sparksRef   = useRef<Spark[]>([]);
  const impactedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // DPR-aware sizing
    const DPR = Math.min(window.devicePixelRatio ?? 1, 2);
    const W   = 220;
    const H   = 220;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(DPR, DPR);

    // Pivot sits above the canvas, centred horizontally.
    // We want the hammer face to land on ANVIL_TOP_Y at ANGLE_IMPACT.
    // pivot.y = ANVIL_TOP_Y - ARM_LEN * cos(ANGLE_IMPACT)
    const cx      = W / 2;
    const pivotX  = cx;
    const pivotY  = ANVIL_TOP_Y - ARM_LEN * Math.cos(ANGLE_IMPACT);

    // ── spark factory ─────────────────────────────────────────────────────────
    function burst(ix: number, iy: number) {
      const count = 24;
      for (let i = 0; i < count; i++) {
        // Fan outward ±80° from horizontal, biased left and right
        const baseAngle = Math.PI + (Math.random() - 0.5) * (Math.PI * 0.9);
        const speed = 1.8 + Math.random() * 3.2;
        sparksRef.current.push({
          x:    ix,
          y:    iy,
          vx:   Math.cos(baseAngle) * speed,
          vy:   Math.sin(baseAngle) * speed - 1.2,
          life: 0.9 + Math.random() * 0.1,
          size: 1.4 + Math.random() * 2.2,
          hue:  22 + Math.random() * 30,
        });
      }
    }

    // ── draw anvil ────────────────────────────────────────────────────────────
    function drawAnvil(glowAmt: number) {
      const ax = cx - ANVIL_W / 2;

      // Glow halo on impact
      if (glowAmt > 0) {
        const grad = ctx.createRadialGradient(cx, ANVIL_TOP_Y, 4, cx, ANVIL_TOP_Y, 46);
        grad.addColorStop(0, `rgba(245,158,11,${0.55 * glowAmt})`);
        grad.addColorStop(0.5, `rgba(251,191,36,${0.18 * glowAmt})`);
        grad.addColorStop(1, "rgba(245,158,11,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cx, ANVIL_TOP_Y + 4, 46, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Top block (the working face)
      ctx.fillStyle = "#2d3748";
      ctx.beginPath();
      ctx.roundRect(ax, ANVIL_TOP_Y - ANVIL_H_TOP, ANVIL_W, ANVIL_H_TOP, [4, 4, 0, 0]);
      ctx.fill();

      // Top edge highlight
      ctx.fillStyle = glowAmt > 0
        ? `rgba(251,191,36,${0.6 * glowAmt + 0.25})`
        : "#4a5568";
      ctx.fillRect(ax + 2, ANVIL_TOP_Y - ANVIL_H_TOP, ANVIL_W - 4, 3);

      // Waist
      const wx = cx - ANVIL_WAIST_W / 2;
      ctx.fillStyle = "#1a202c";
      ctx.fillRect(wx, ANVIL_TOP_Y, ANVIL_WAIST_W, ANVIL_WAIST_H);

      // Base
      const bx = cx - ANVIL_BASE_W / 2;
      ctx.fillStyle = "#171923";
      ctx.beginPath();
      ctx.roundRect(
        bx,
        ANVIL_TOP_Y + ANVIL_WAIST_H,
        ANVIL_BASE_W,
        ANVIL_BASE_H,
        [0, 0, 3, 3]
      );
      ctx.fill();

      // Teal rim light (brand accent) on front face
      const rimGrad = ctx.createLinearGradient(ax, ANVIL_TOP_Y - ANVIL_H_TOP, ax, ANVIL_TOP_Y);
      rimGrad.addColorStop(0, "rgba(20,184,166,0.0)");
      rimGrad.addColorStop(1, "rgba(20,184,166,0.18)");
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.roundRect(ax, ANVIL_TOP_Y - ANVIL_H_TOP, ANVIL_W, ANVIL_H_TOP, [4, 4, 0, 0]);
      ctx.fill();
    }

    // ── draw hammer (pivot → angle) ───────────────────────────────────────────
    function drawHammer(angle: number, shudder: number) {
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(angle + (Math.random() - 0.5) * shudder * 0.04);

      // Handle — drawn from pivot downward along the arm
      ctx.fillStyle = "#7c3a10";
      ctx.beginPath();
      ctx.roundRect(
        -HANDLE_W / 2,
        0,
        HANDLE_W,
        ARM_LEN - HEAD_H * 0.4,
        [3, 3, 1, 1]
      );
      ctx.fill();

      // Handle grain lines (subtle texture)
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 0.8;
      for (let i = 10; i < ARM_LEN - HEAD_H * 0.4 - 4; i += 10) {
        ctx.beginPath();
        ctx.moveTo(-HANDLE_W / 2 + 2, i);
        ctx.lineTo(HANDLE_W / 2 - 2, i + 2);
        ctx.stroke();
      }

      // Hammer head — positioned so its bottom face is at ARM_LEN from pivot
      const headY = ARM_LEN - HEAD_H;

      // Shadow/depth layer
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.roundRect(-HEAD_W / 2 + 2, headY + 2, HEAD_W, HEAD_H, 4);
      ctx.fill();

      // Main head body
      const headGrad = ctx.createLinearGradient(
        -HEAD_W / 2, headY,
         HEAD_W / 2, headY + HEAD_H
      );
      headGrad.addColorStop(0, "#4a5568");
      headGrad.addColorStop(0.4, "#2d3748");
      headGrad.addColorStop(1, "#1a202c");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.roundRect(-HEAD_W / 2, headY, HEAD_W, HEAD_H, 4);
      ctx.fill();

      // Top bevel highlight
      ctx.fillStyle = "#718096";
      ctx.beginPath();
      ctx.roundRect(-HEAD_W / 2 + 1, headY + 1, HEAD_W - 2, 4, [3, 3, 0, 0]);
      ctx.fill();

      // Strike face bottom edge — white hot on impact
      const faceAlpha = Math.max(0, shudder);
      if (faceAlpha > 0) {
        ctx.fillStyle = `rgba(255,255,255,${faceAlpha * 0.9})`;
        ctx.fillRect(-HEAD_W / 2 + 2, headY + HEAD_H - 3, HEAD_W - 4, 3);
      }

      ctx.restore();
    }

    // ── draw sparks ───────────────────────────────────────────────────────────
    function drawSparks() {
      sparksRef.current = sparksRef.current
        .map((s) => ({
          ...s,
          x:    s.x + s.vx,
          y:    s.y + s.vy,
          vy:   s.vy + 0.22,
          vx:   s.vx * 0.96,
          life: s.life - 0.032,
        }))
        .filter((s) => s.life > 0);

      for (const s of sparksRef.current) {
        const alpha = Math.pow(s.life, 1.4) * 0.95;
        const r = s.size * Math.pow(s.life, 0.6);

        // Core — white-hot centre
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,240,${alpha})`;
        ctx.fill();

        // Outer glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue},95%,58%,${alpha * 0.7})`;
        ctx.fill();
      }
    }

    // ── main render loop ──────────────────────────────────────────────────────
    function render(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) % CYCLE_MS;
      const t       = elapsed / CYCLE_MS;

      // ── compute hammer angle ──────────────────────────────────────────────
      let angle: number;
      let shudder = 0;

      if (t < IMPACT_AT) {
        // Wind-up (0 → IMPACT_AT): rest → impact
        // Split: first 40% is slow ease-in wind-up, last 60% is fast drop
        const phase = t / IMPACT_AT;
        if (phase < 0.4) {
          // slow lift to full back angle
          angle = ANGLE_REST * easeInCubic(phase / 0.4);
        } else {
          // fast slam down to impact
          const drop = (phase - 0.4) / 0.6;
          angle = ANGLE_REST + (ANGLE_IMPACT - ANGLE_REST) * easeOutQuart(drop);
        }
      } else if (t < REBOUND_END) {
        // Rebound (IMPACT_AT → REBOUND_END)
        const phase = (t - IMPACT_AT) / (REBOUND_END - IMPACT_AT);
        angle   = ANGLE_IMPACT + (ANGLE_REBOUND - ANGLE_IMPACT) * easeOutBack(phase, 2.2);
        shudder = Math.max(0, 1 - phase * 3);
      } else {
        // Rest pause (REBOUND_END → 1.0): hold at rebound angle
        angle = ANGLE_REBOUND;
      }

      // ── trigger impact sparks exactly once per cycle ───────────────────────
      const wasJustImpact = t >= IMPACT_AT && t < IMPACT_AT + 0.025;
      if (wasJustImpact && !impactedRef.current) {
        // Impact point = end of arm at impact angle
        const ix = pivotX + ARM_LEN * Math.sin(ANGLE_IMPACT);
        const iy = pivotY + ARM_LEN * Math.cos(ANGLE_IMPACT);
        burst(ix, iy);
        impactedRef.current = true;
      }
      if (!wasJustImpact && t > IMPACT_AT + 0.025) {
        impactedRef.current = false;
      }

      // ── paint ─────────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);

      // Ambient forge glow (always-on, subtle)
      const ambientGrad = ctx.createRadialGradient(cx, ANVIL_TOP_Y, 0, cx, ANVIL_TOP_Y, 60);
      ambientGrad.addColorStop(0, "rgba(245,158,11,0.07)");
      ambientGrad.addColorStop(1, "rgba(245,158,11,0)");
      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.ellipse(cx, ANVIL_TOP_Y + 8, 60, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      const glowAmt = Math.max(0, 1 - (t - IMPACT_AT) / 0.14);
      drawAnvil(t >= IMPACT_AT && t < IMPACT_AT + 0.14 ? glowAmt : 0);
      drawSparks();
      drawHammer(angle, shudder);

      frameRef.current = requestAnimationFrame(render);
    }

    frameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-5 select-none",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none"
      />

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-foreground leading-relaxed">
          {label}
        </p>
        <p className="text-xs text-muted-foreground">
          This may take a moment...
        </p>
      </div>
    </div>
  );
}
