"use client";

/**
 * Forge Loading — Anvil Strike
 *
 * Pure canvas, single RAF loop. No rotation transform tricks.
 * The hammer is drawn directly from its computed (x,y) head position
 * so it is always visually flush with the anvil top surface at impact.
 *
 * Coordinate model
 * ─────────────────
 * Canvas: 200 × 220 px (logical). DPR-scaled for retina.
 *
 * The hammer swings on a pendulum pivot fixed above centre.
 * At each frame we compute the head centre from the pivot + arm angle,
 * then draw the head and handle at those exact pixel coordinates.
 * The anvil top surface (ANVIL_TOP_Y) equals the hammer face Y at impact
 * by construction — no guesswork.
 *
 * Cycle phases  (CYCLE_MS = 1 400 ms)
 *  [0 %  – 25%]  slow wind-up   ease-in-cubic  (rest → back)
 *  [25% – 52%]   fast slam      ease-out-quart  (back → impact)
 *  [52% – 65%]   rebound        ease-out-back   (impact → rebound)
 *  [65% – 100%]  rest pause     hold at rebound
 */

import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";

// ── types ─────────────────────────────────────────────────────────────────────

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1 → 0
  size: number;
  hue: number;
}

interface ForgeLoadingAnvilProps {
  label?: string;
  className?: string;
}

// ── canvas dimensions ─────────────────────────────────────────────────────────

const W = 200;
const H = 220;

// ── hammer geometry ───────────────────────────────────────────────────────────

const HEAD_W = 34; // hammer head width  (px)
const HEAD_H = 20; // hammer head height (px)
const HANDLE_W = 8; // handle width
const HANDLE_L = 56; // handle length (pivot → head top)

// ── anvil geometry ────────────────────────────────────────────────────────────

// Top surface of anvil.  The hammer face will sit on this Y at impact.
const ANVIL_TOP_Y = 152;
const ANVIL_FACE_H = 18; // height of the top working block
const ANVIL_W = 72;
const ANVIL_WAIST_W = 30;
const ANVIL_WAIST_H = 10;
const ANVIL_BASE_W = 56;
const ANVIL_BASE_H = 12;

// ── pendulum setup ────────────────────────────────────────────────────────────
// ARM_LEN = distance from pivot to bottom of hammer head (the strike face)
// pivotY  = ANVIL_TOP_Y - ARM_LEN   (pivot is directly above the strike point
//           when the hammer is vertical — i.e. at angle 0)
// At impact we use angle 0 (straight down), so the face is exactly at ANVIL_TOP_Y.

const ARM_LEN = 76; // pivot → hammer face
const pivotX = W / 2;
const pivotY = ANVIL_TOP_Y - ARM_LEN; // = 76 px from top

// Swing angles (radians, 0 = straight down)
const ANGLE_BACK = -0.72; // wound-up back-swing (to the left)
const ANGLE_IMPACT = 0.0; // straight down — face flush on anvil
const ANGLE_REBOUND = -0.22; // small upward bounce-back

// ── timing ────────────────────────────────────────────────────────────────────

const CYCLE_MS = 1_400;
const T_WINDUP_END = 0.25; // fraction
const T_IMPACT = 0.52;
const T_REBOUND_END = 0.65;

// ── easing ────────────────────────────────────────────────────────────────────

const easeInCubic = (t: number) => t * t * t;
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
function easeOutBack(t: number, s = 1.6) {
  const c3 = s + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ── component ─────────────────────────────────────────────────────────────────

export function ForgeLoadingAnvil({
  label = "Forging your group...",
  className,
}: ForgeLoadingAnvilProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const firedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio ?? 1, 2);
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(DPR, DPR);

    // ── helpers ───────────────────────────────────────────────────────────────

    /** Compute the (x,y) of a point along the pendulum arm at a given angle. */
    function armTip(angle: number, dist: number) {
      return {
        x: pivotX + Math.sin(angle) * dist,
        y: pivotY + Math.cos(angle) * dist,
      };
    }

    // ── spark burst ───────────────────────────────────────────────────────────

    function burst(ix: number, iy: number) {
      for (let i = 0; i < 26; i++) {
        // Scatter mostly sideways, some upward — like metal shards flying off
        const a = Math.PI + (Math.random() - 0.5) * Math.PI * 1.1;
        const spd = 1.6 + Math.random() * 3.4;
        sparksRef.current.push({
          x: ix,
          y: iy,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd - 0.8,
          life: 0.85 + Math.random() * 0.15,
          size: 1.2 + Math.random() * 2.4,
          hue: 20 + Math.random() * 35,
        });
      }
    }

    // ── draw anvil ────────────────────────────────────────────────────────────

    function drawAnvil(impactGlow: number) {
      const cx = W / 2;

      // Impact glow halo
      if (impactGlow > 0) {
        const g = ctx.createRadialGradient(
          cx, ANVIL_TOP_Y, 2,
          cx, ANVIL_TOP_Y, 52
        );
        g.addColorStop(0, `rgba(251,191,36,${0.6 * impactGlow})`);
        g.addColorStop(0.5, `rgba(245,158,11,${0.2 * impactGlow})`);
        g.addColorStop(1, "rgba(245,158,11,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(cx, ANVIL_TOP_Y + 6, 52, 20, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Working face (top block)
      const topX = cx - ANVIL_W / 2;
      const topY = ANVIL_TOP_Y - ANVIL_FACE_H;
      const faceGrad = ctx.createLinearGradient(topX, topY, topX, ANVIL_TOP_Y);
      faceGrad.addColorStop(0, "#3d4d63");
      faceGrad.addColorStop(1, "#252f3f");
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.roundRect(topX, topY, ANVIL_W, ANVIL_FACE_H, [5, 5, 0, 0]);
      ctx.fill();

      // Top-edge highlight (gleam) — brightens on impact
      const gleamAlpha = impactGlow > 0 ? 0.3 + impactGlow * 0.55 : 0.3;
      ctx.fillStyle = `rgba(255,255,255,${gleamAlpha})`;
      ctx.fillRect(topX + 3, topY + 1, ANVIL_W - 6, 3);

      // Teal brand rim along the bottom of the face
      const rimGrad = ctx.createLinearGradient(topX, topY, topX + ANVIL_W, topY);
      rimGrad.addColorStop(0, "rgba(20,184,166,0)");
      rimGrad.addColorStop(0.5, "rgba(20,184,166,0.22)");
      rimGrad.addColorStop(1, "rgba(20,184,166,0)");
      ctx.fillStyle = rimGrad;
      ctx.fillRect(topX, ANVIL_TOP_Y - 3, ANVIL_W, 3);

      // Waist
      const wx = cx - ANVIL_WAIST_W / 2;
      ctx.fillStyle = "#1a2232";
      ctx.fillRect(wx, ANVIL_TOP_Y, ANVIL_WAIST_W, ANVIL_WAIST_H);

      // Base
      const bx = cx - ANVIL_BASE_W / 2;
      ctx.fillStyle = "#141b27";
      ctx.beginPath();
      ctx.roundRect(
        bx,
        ANVIL_TOP_Y + ANVIL_WAIST_H,
        ANVIL_BASE_W,
        ANVIL_BASE_H,
        [0, 0, 4, 4]
      );
      ctx.fill();

      // Side shadow gradient on the base
      const sideGrad = ctx.createLinearGradient(bx, 0, bx + ANVIL_BASE_W, 0);
      sideGrad.addColorStop(0, "rgba(0,0,0,0.35)");
      sideGrad.addColorStop(0.5, "rgba(0,0,0,0)");
      sideGrad.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = sideGrad;
      ctx.beginPath();
      ctx.roundRect(
        bx,
        ANVIL_TOP_Y + ANVIL_WAIST_H,
        ANVIL_BASE_W,
        ANVIL_BASE_H,
        [0, 0, 4, 4]
      );
      ctx.fill();
    }

    // ── draw hammer ───────────────────────────────────────────────────────────

    function drawHammer(angle: number, impactGlow: number) {
      // All points derived from the pendulum arm — no ctx.rotate() needed.

      // Head centre (bottom of head = strike face = armTip at ARM_LEN)
      const face = armTip(angle, ARM_LEN);       // bottom of head (contact point)
      const headTop = armTip(angle, ARM_LEN - HEAD_H); // top of head

      // Head bounding box corners (perpendicular to arm)
      const perp = { x: Math.cos(angle), y: -Math.sin(angle) }; // perpendicular unit vector

      const hw = HEAD_W / 2;
      const corners = {
        tl: { x: headTop.x - perp.x * hw, y: headTop.y - perp.y * hw },
        tr: { x: headTop.x + perp.x * hw, y: headTop.y + perp.y * hw },
        bl: { x: face.x - perp.x * hw,    y: face.y - perp.y * hw },
        br: { x: face.x + perp.x * hw,    y: face.y + perp.y * hw },
      };

      // Handle — from pivot down to top of head
      const handleBase = armTip(angle, ARM_LEN - HEAD_H + 4); // overlaps head slightly
      const hw2 = HANDLE_W / 2;
      ctx.fillStyle = "#6b3009";
      ctx.beginPath();
      ctx.moveTo(pivotX - perp.x * hw2, pivotY - perp.y * hw2);
      ctx.lineTo(pivotX + perp.x * hw2, pivotY + perp.y * hw2);
      ctx.lineTo(handleBase.x + perp.x * hw2, handleBase.y + perp.y * hw2);
      ctx.lineTo(handleBase.x - perp.x * hw2, handleBase.y - perp.y * hw2);
      ctx.closePath();
      ctx.fill();

      // Handle highlight stripe
      ctx.strokeStyle = "rgba(160,90,40,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pivotX - perp.x * (hw2 - 1.5), pivotY - perp.y * (hw2 - 1.5));
      ctx.lineTo(handleBase.x - perp.x * (hw2 - 1.5), handleBase.y - perp.y * (hw2 - 1.5));
      ctx.stroke();

      // Drop shadow under head
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.beginPath();
      ctx.moveTo(corners.tl.x + 2, corners.tl.y + 2);
      ctx.lineTo(corners.tr.x + 2, corners.tr.y + 2);
      ctx.lineTo(corners.br.x + 2, corners.br.y + 2);
      ctx.lineTo(corners.bl.x + 2, corners.bl.y + 2);
      ctx.closePath();
      ctx.fill();

      // Head body — steel gradient along the arm direction
      const headGrad = ctx.createLinearGradient(
        headTop.x, headTop.y,
        face.x, face.y
      );
      headGrad.addColorStop(0, "#4a5568");
      headGrad.addColorStop(0.5, "#2d3748");
      headGrad.addColorStop(1, "#1a202c");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.moveTo(corners.tl.x, corners.tl.y);
      ctx.lineTo(corners.tr.x, corners.tr.y);
      ctx.lineTo(corners.br.x, corners.br.y);
      ctx.lineTo(corners.bl.x, corners.bl.y);
      ctx.closePath();
      ctx.fill();

      // Bevel highlight on top of head
      const bevelOff = 3;
      ctx.fillStyle = "#718096";
      ctx.beginPath();
      ctx.moveTo(corners.tl.x + perp.x * bevelOff + (face.x - headTop.x) / ARM_LEN * bevelOff,
                 corners.tl.y + perp.y * bevelOff + (face.y - headTop.y) / ARM_LEN * bevelOff);
      ctx.lineTo(corners.tr.x - perp.x * bevelOff + (face.x - headTop.x) / ARM_LEN * bevelOff,
                 corners.tr.y - perp.y * bevelOff + (face.y - headTop.y) / ARM_LEN * bevelOff);
      ctx.lineTo(corners.tr.x, corners.tr.y);
      ctx.lineTo(corners.tl.x, corners.tl.y);
      ctx.closePath();
      ctx.fill();

      // Strike face — white-hot glow on impact
      if (impactGlow > 0) {
        ctx.fillStyle = `rgba(255,240,180,${impactGlow * 0.85})`;
        ctx.beginPath();
        ctx.moveTo(corners.bl.x, corners.bl.y);
        ctx.lineTo(corners.br.x, corners.br.y);
        ctx.lineTo(
          corners.br.x - (face.x - headTop.x) / ARM_LEN * 4,
          corners.br.y - (face.y - headTop.y) / ARM_LEN * 4
        );
        ctx.lineTo(
          corners.bl.x - (face.x - headTop.x) / ARM_LEN * 4,
          corners.bl.y - (face.y - headTop.y) / ARM_LEN * 4
        );
        ctx.closePath();
        ctx.fill();
      }
    }

    // ── draw sparks ───────────────────────────────────────────────────────────

    function drawSparks() {
      sparksRef.current = sparksRef.current
        .map((s) => ({
          ...s,
          x: s.x + s.vx,
          y: s.y + s.vy,
          vy: s.vy + 0.24,
          vx: s.vx * 0.97,
          life: s.life - 0.034,
        }))
        .filter((s) => s.life > 0);

      for (const s of sparksRef.current) {
        const a = Math.pow(s.life, 1.3) * 0.92;
        const r = s.size * Math.pow(s.life, 0.5);
        // White-hot core
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,230,${a})`;
        ctx.fill();
        // Amber halo
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue},96%,58%,${a * 0.65})`;
        ctx.fill();
      }
    }

    // ── main loop ─────────────────────────────────────────────────────────────

    function render(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const t = ((ts - startRef.current) % CYCLE_MS) / CYCLE_MS; // 0 → 1

      // ── angle ──────────────────────────────────────────────────────────────
      let angle: number;
      let impactGlow = 0;

      if (t < T_WINDUP_END) {
        // Slow wind-up: straight down → back angle
        const p = t / T_WINDUP_END;
        angle = lerp(ANGLE_IMPACT, ANGLE_BACK, easeInCubic(p));
      } else if (t < T_IMPACT) {
        // Fast slam: back angle → impact (straight down)
        const p = (t - T_WINDUP_END) / (T_IMPACT - T_WINDUP_END);
        angle = lerp(ANGLE_BACK, ANGLE_IMPACT, easeOutQuart(p));
      } else if (t < T_REBOUND_END) {
        // Rebound: impact → rebound angle
        const p = (t - T_IMPACT) / (T_REBOUND_END - T_IMPACT);
        angle = lerp(ANGLE_IMPACT, ANGLE_REBOUND, easeOutBack(p, 1.8));
        impactGlow = Math.max(0, 1 - p * 2.2);
      } else {
        // Rest pause: hold at rebound
        angle = ANGLE_REBOUND;
      }

      // ── impact trigger (once per cycle) ────────────────────────────────────
      const justImpacted = t >= T_IMPACT && t < T_IMPACT + 0.022;
      if (justImpacted && !firedRef.current) {
        // Strike point = arm tip at ANGLE_IMPACT = straight down
        // = (pivotX, pivotY + ARM_LEN) = (W/2, ANVIL_TOP_Y)
        burst(pivotX, ANVIL_TOP_Y);
        firedRef.current = true;
      }
      if (t < T_IMPACT || t > T_IMPACT + 0.022) {
        firedRef.current = false;
      }

      // ── paint ──────────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);

      // Ambient always-on glow beneath hammer/anvil contact zone
      const ag = ctx.createRadialGradient(W / 2, ANVIL_TOP_Y, 0, W / 2, ANVIL_TOP_Y, 55);
      ag.addColorStop(0, "rgba(245,158,11,0.06)");
      ag.addColorStop(1, "rgba(245,158,11,0)");
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.ellipse(W / 2, ANVIL_TOP_Y + 8, 55, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      const glow = t >= T_IMPACT && t < T_REBOUND_END ? impactGlow : 0;
      drawAnvil(glow);
      drawSparks();
      drawHammer(angle, glow);

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
