import { ANIMATION_CONFIG } from "@/shared/constants/voronoi.constants";
import type {
  Dimensions,
  MouseState,
} from "@/shared/lib/voronoi/voronoi-contract";

export interface AnimationCanvasTarget {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export function getAnimationCanvasTarget(
  canvas: HTMLCanvasElement | null,
  dimensions: Dimensions,
): AnimationCanvasTarget | null {
  if (!hasDrawableDimensions(dimensions)) {
    return null;
  }

  return getCanvasContextTarget(canvas);
}

function hasDrawableDimensions(dimensions: Dimensions) {
  return dimensions.width !== 0 && dimensions.height !== 0;
}

function getCanvasContextTarget(
  canvas: HTMLCanvasElement | null,
): AnimationCanvasTarget | null {
  if (!canvas) {
    return null;
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  return ctx ? { canvas, ctx } : null;
}

export function getVoronoiBounds(
  dimensions: Dimensions,
): [number, number, number, number] {
  return [
    -dimensions.width * 0.5,
    -dimensions.height * 0.5,
    dimensions.width * 1.5,
    dimensions.height * 1.5,
  ];
}

export function prepareCanvasFrame({
  ctx,
  dimensions,
  dpr,
  startTime,
}: {
  ctx: CanvasRenderingContext2D;
  dimensions: Dimensions;
  dpr: number;
  startTime: number;
}) {
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, dimensions.width, dimensions.height);
  ctx.globalAlpha = Math.min((Date.now() - startTime) / 1500, 1);
}

export function setCanvasFrameTransform(
  canvas: HTMLCanvasElement,
  currentMouse: MouseState,
  center: MouseState,
  rotationDegrees: number,
) {
  const frameX =
    (currentMouse.x - center.x) * ANIMATION_CONFIG.frameParallaxFactor;
  const frameY =
    (currentMouse.y - center.y) * ANIMATION_CONFIG.frameParallaxFactor;
  canvas.style.transform = `scale(1.25) rotate(${rotationDegrees}deg) translate(${frameX}px, ${frameY}px)`;
}
