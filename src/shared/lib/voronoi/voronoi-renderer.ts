import type { Voronoi } from "d3-delaunay";
import { ANIMATION_CONFIG, COLORS } from "@/shared/constants/voronoi.constants";
import type { Point } from "./voronoi-contract";

export function drawParticleCells(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  flatPoints: Float64Array,
  voronoi: Voronoi<Float64Array>,
  canvasMouseX: number,
  canvasMouseY: number,
  typingPulse: number,
  mouseActive: boolean,
) {
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const cell = voronoi.cellPolygon(i);
    if (!cell) continue;

    ctx.beginPath();
    for (let j = 0; j < cell.length; j++) {
      if (j === 0) ctx.moveTo(cell[j][0], cell[j][1]);
      else ctx.lineTo(cell[j][0], cell[j][1]);
    }
    ctx.closePath();

    const baseOpacity = p.opacity + typingPulse * 0.02;
    const drawX = flatPoints[i * 2];
    const drawY = flatPoints[i * 2 + 1];
    const hDistX = drawX - canvasMouseX;
    const hDistY = drawY - canvasMouseY;
    const hoverDist = Math.sqrt(hDistX * hDistX + hDistY * hDistY);

    if (hoverDist < ANIMATION_CONFIG.hoverRadius && mouseActive) {
      const hoverIntensity = 1 - hoverDist / ANIMATION_CONFIG.hoverRadius;
      ctx.fillStyle = `rgba(13, 148, 136, ${Math.min(1, baseOpacity + 0.4 * hoverIntensity)})`;

      ctx.beginPath();
      for (let j = 0; j < cell.length; j++) {
        if (j === 0) ctx.moveTo(cell[j][0], cell[j][1]);
        else ctx.lineTo(cell[j][0], cell[j][1]);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(13, 148, 136, ${0.4 * hoverIntensity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(13, 148, 136, ${baseOpacity})`;
    }

    ctx.fill();

    ctx.strokeStyle = "rgba(13, 148, 136, 0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = "rgba(13, 148, 136, 0.05)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export function drawCatalystCore(
  ctx: CanvasRenderingContext2D,
  coreAvgX: number,
  coreAvgY: number,
  sparkPhase: number,
  amberOpacity: number,
) {
  const timeNow = Date.now();
  const coreRadius = (8 * sparkPhase + Math.sin(timeNow / 150) * 1.5) * 0.75;

  const outerGlowRadius =
    60 * sparkPhase * (1 + Math.sin(timeNow / 800) * 0.1) * 0.75;
  ctx.beginPath();
  ctx.arc(coreAvgX, coreAvgY, outerGlowRadius, 0, Math.PI * 2);
  const outerGradient = ctx.createRadialGradient(
    coreAvgX,
    coreAvgY,
    0,
    coreAvgX,
    coreAvgY,
    outerGlowRadius,
  );
  outerGradient.addColorStop(0, `rgba(245, 158, 11, ${amberOpacity * 0.3})`);
  outerGradient.addColorStop(1, "rgba(245, 158, 11, 0)");
  ctx.fillStyle = outerGradient;
  ctx.fill();

  const innerGlowRadius =
    24 * sparkPhase * (1 + Math.sin(timeNow / 300) * 0.2) * 0.75;
  ctx.beginPath();
  ctx.arc(coreAvgX, coreAvgY, innerGlowRadius, 0, Math.PI * 2);
  const innerGradient = ctx.createRadialGradient(
    coreAvgX,
    coreAvgY,
    0,
    coreAvgX,
    coreAvgY,
    innerGlowRadius,
  );
  innerGradient.addColorStop(0, `rgba(245, 158, 11, ${amberOpacity * 0.8})`);
  innerGradient.addColorStop(1, "rgba(245, 158, 11, 0)");
  ctx.fillStyle = innerGradient;
  ctx.fill();

  // Rays
  const numRays = 8;
  ctx.save();
  ctx.translate(coreAvgX, coreAvgY);
  ctx.rotate(timeNow / 3000);
  for (let r = 0; r < numRays; r++) {
    const rayAngle = (r / numRays) * Math.PI * 2;
    const rayLength =
      (15 + Math.sin(timeNow / 200 + r) * 5) * sparkPhase * 0.75;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(rayAngle) * rayLength, Math.sin(rayAngle) * rayLength);
    ctx.strokeStyle = `rgba(245, 158, 11, ${amberOpacity * 0.6})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();

  // Sharp Core
  ctx.beginPath();
  ctx.arc(coreAvgX, coreAvgY, Math.max(0.1, coreRadius * 0.5), 0, Math.PI * 2);
  ctx.fillStyle = COLORS.amberLight;
  ctx.fill();

  // Secondary ring
  ctx.beginPath();
  ctx.arc(coreAvgX, coreAvgY, Math.max(0.1, coreRadius * 0.8), 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(245, 158, 11, ${amberOpacity * 0.8})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Pulse Ring
  const pulseTime = (timeNow / 800) % 1;
  const pulseRadius = pulseTime * 120 * sparkPhase;
  const pulseOpacity = (1 - pulseTime) * amberOpacity * 0.4;
  ctx.beginPath();
  ctx.arc(coreAvgX, coreAvgY, Math.max(0.1, pulseRadius), 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(245, 158, 11, ${pulseOpacity})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Tech Ring
  ctx.save();
  ctx.translate(coreAvgX, coreAvgY);
  ctx.rotate(-timeNow / 4000);
  ctx.beginPath();
  ctx.arc(0, 0, 40 * sparkPhase, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(13, 148, 136, ${amberOpacity * 0.5})`;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}
