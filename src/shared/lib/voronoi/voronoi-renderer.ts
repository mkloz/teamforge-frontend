import type { Voronoi } from "d3-delaunay";
import {
  ANIMATION_CONFIG,
  COLORS,
  NUM_FORMATION,
  NUM_GUARD,
} from "@/shared/constants/voronoi.constants";
import type { Point, VoronoiFormationLayout } from "./voronoi-contract";

type VoronoiCell = ReturnType<Voronoi<Float64Array>["cellPolygon"]>;
type RgbColor = readonly [number, number, number];

const FORMATION_TEAL: RgbColor = [55, 131, 113];
const FORMATION_TEAL_EDGE: RgbColor = [74, 157, 137];
const FORMATION_AMBER: RgbColor = [245, 158, 11];
const FORMATION_AMBER_EDGE: RgbColor = [251, 191, 36];

export function drawParticleCells(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  flatPoints: Float64Array,
  voronoi: Voronoi<Float64Array>,
  canvasMouseX: number,
  canvasMouseY: number,
  typingPulse: number,
  mouseActive: boolean,
  formation: VoronoiFormationLayout,
  formationProgress: number,
) {
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const cell = voronoi.cellPolygon(i);
    if (!cell) continue;

    traceVoronoiCell(ctx, cell);

    const isFormationCell = i < NUM_FORMATION;
    const isAssemblyCell = i < NUM_FORMATION + NUM_GUARD;
    const assemblyFade = isAssemblyCell
      ? 1 - formationProgress * 0.78
      : 1 - formationProgress * 0.22;
    const baseOpacity = (p.opacity + typingPulse * 0.015) * assemblyFade;
    const drawX = flatPoints[i * 2];
    const drawY = flatPoints[i * 2 + 1];

    const hoverState = getCellHoverState({
      canvasMouseX,
      canvasMouseY,
      drawX,
      drawY,
      mouseActive,
    });

    if (hoverState.isHovered) {
      drawCellHoverOverlay({
        baseOpacity,
        ctx,
        hoverIntensity: hoverState.intensity,
      });
    } else {
      ctx.fillStyle = `rgba(55, 131, 113, ${baseOpacity})`;
    }

    ctx.fill();

    strokeParticleCellEdges(ctx, formationProgress, isAssemblyCell);
    if (isFormationCell && formationProgress > 0.02) {
      drawAssembledParticleCell({
        accentWeight: formation.accentWeights[i] ?? 0,
        cell,
        cellRadius: formation.cellRadius,
        ctx,
        formationProgress,
        index: i,
        siteX: drawX,
        siteY: drawY,
      });
    }
  }
}

function drawAssembledParticleCell({
  accentWeight,
  cell,
  cellRadius,
  ctx,
  formationProgress,
  index,
  siteX,
  siteY,
}: {
  accentWeight: number;
  cell: VoronoiCell;
  cellRadius: number;
  ctx: CanvasRenderingContext2D;
  formationProgress: number;
  index: number;
  siteX: number;
  siteY: number;
}) {
  const reveal = smoothstep(0.08, 0.94, formationProgress);
  const maxRadius = cellRadius * (1.14 - reveal * 0.14);
  const inset = 0.9 - reveal * 0.08;

  ctx.beginPath();
  for (let vertexIndex = 0; vertexIndex < cell.length; vertexIndex++) {
    const deltaX = cell[vertexIndex][0] - siteX;
    const deltaY = cell[vertexIndex][1] - siteY;
    const distance = Math.hypot(deltaX, deltaY);
    const radiusScale = distance > 0 ? Math.min(1, maxRadius / distance) : 1;
    const x = siteX + deltaX * radiusScale * inset;
    const y = siteY + deltaY * radiusScale * inset;
    if (vertexIndex === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const tone = ((index * 17) % 13) / 12;
  const accentReveal =
    Math.max(0, Math.min(1, accentWeight)) *
    smoothstep(0.28, 0.92, formationProgress);
  ctx.fillStyle = toRgba(
    mixRgb(FORMATION_TEAL, FORMATION_AMBER, accentReveal),
    (0.58 + tone * 0.2) * reveal,
  );
  ctx.fill();
  ctx.strokeStyle = toRgba(
    mixRgb(FORMATION_TEAL_EDGE, FORMATION_AMBER_EDGE, accentReveal),
    reveal * (0.22 + tone * 0.14),
  );
  ctx.lineWidth = 0.75;
  ctx.stroke();
}

function mixRgb(from: RgbColor, to: RgbColor, amount: number): RgbColor {
  return [
    Math.round(from[0] + (to[0] - from[0]) * amount),
    Math.round(from[1] + (to[1] - from[1]) * amount),
    Math.round(from[2] + (to[2] - from[2]) * amount),
  ];
}

function toRgba(color: RgbColor, alpha: number) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

function smoothstep(edgeStart: number, edgeEnd: number, value: number) {
  const normalized = Math.max(
    0,
    Math.min(1, (value - edgeStart) / (edgeEnd - edgeStart)),
  );
  return normalized * normalized * (3 - 2 * normalized);
}

function traceVoronoiCell(ctx: CanvasRenderingContext2D, cell: VoronoiCell) {
  ctx.beginPath();
  for (let j = 0; j < cell.length; j++) {
    if (j === 0) ctx.moveTo(cell[j][0], cell[j][1]);
    else ctx.lineTo(cell[j][0], cell[j][1]);
  }
  ctx.closePath();
}

function getCellHoverState({
  canvasMouseX,
  canvasMouseY,
  drawX,
  drawY,
  mouseActive,
}: {
  canvasMouseX: number;
  canvasMouseY: number;
  drawX: number;
  drawY: number;
  mouseActive: boolean;
}) {
  const hDistX = drawX - canvasMouseX;
  const hDistY = drawY - canvasMouseY;
  const hoverDist = Math.sqrt(hDistX * hDistX + hDistY * hDistY);

  if (hoverDist < ANIMATION_CONFIG.hoverRadius && mouseActive) {
    return {
      intensity: 1 - hoverDist / ANIMATION_CONFIG.hoverRadius,
      isHovered: true,
    };
  }

  return {
    intensity: 0,
    isHovered: false,
  };
}

function drawCellHoverOverlay({
  baseOpacity,
  ctx,
  hoverIntensity,
}: {
  baseOpacity: number;
  ctx: CanvasRenderingContext2D;
  hoverIntensity: number;
}) {
  ctx.fillStyle = `rgba(74, 157, 137, ${Math.min(1, baseOpacity + 0.2 * hoverIntensity)})`;
}

function strokeParticleCellEdges(
  ctx: CanvasRenderingContext2D,
  formationProgress: number,
  isAssemblyCell: boolean,
) {
  const fade =
    1 - smoothstep(0.2, 0.9, formationProgress) * (isAssemblyCell ? 0.9 : 0.62);
  ctx.strokeStyle = `rgba(55, 131, 113, ${0.15 * fade})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.strokeStyle = `rgba(55, 131, 113, ${0.05 * fade})`;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function drawCatalystCore(
  ctx: CanvasRenderingContext2D,
  coreAvgX: number,
  coreAvgY: number,
  particlePhase: number,
  amberOpacity: number,
) {
  const timeNow = Date.now();
  const pulse = (Math.sin(timeNow / 520) + 1) / 2;
  const outerGlowRadius = (18 + pulse * 7) * particlePhase;
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
  outerGradient.addColorStop(0, `rgba(245, 158, 11, ${amberOpacity * 0.24})`);
  outerGradient.addColorStop(1, "rgba(245, 158, 11, 0)");
  ctx.fillStyle = outerGradient;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    coreAvgX,
    coreAvgY,
    Math.max(0.1, 2.5 * particlePhase),
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = COLORS.amberLight;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(coreAvgX, coreAvgY, Math.max(0.1, 5 * particlePhase), 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(245, 158, 11, ${amberOpacity * 0.68})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  const pulseTime = (timeNow / 1600) % 1;
  const pulseRadius = (8 + pulseTime * 30) * particlePhase;
  const pulseOpacity = (1 - pulseTime) * amberOpacity * 0.18;
  ctx.beginPath();
  ctx.arc(coreAvgX, coreAvgY, Math.max(0.1, pulseRadius), 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(245, 158, 11, ${pulseOpacity})`;
  ctx.lineWidth = 1;
  ctx.stroke();
}
