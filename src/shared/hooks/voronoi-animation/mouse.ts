import { ANIMATION_CONFIG } from "@/shared/constants/voronoi.constants";
import type { MouseState } from "@/shared/lib/voronoi/voronoi-contract";

export const INITIAL_MOUSE_POSITION = { x: -1000, y: -1000 } as const;

export function getCanvasPointerPosition({
  center,
  point,
  transform,
}: {
  center: MouseState;
  point: MouseState;
  transform: string;
}) {
  const matrix = parseTransformMatrix(transform);
  if (!matrix) return point;

  const determinant = matrix.a * matrix.d - matrix.b * matrix.c;
  if (Math.abs(determinant) < Number.EPSILON) return point;

  const translatedX = point.x - center.x - matrix.e;
  const translatedY = point.y - center.y - matrix.f;

  return {
    x:
      center.x +
      (matrix.d * translatedX - matrix.c * translatedY) / determinant,
    y:
      center.y +
      (-matrix.b * translatedX + matrix.a * translatedY) / determinant,
  };
}

function parseTransformMatrix(transform: string) {
  if (!transform || transform === "none") return null;
  const values = transform.match(/matrix\(([^)]+)\)/)?.[1]?.split(",");
  if (values?.length !== 6) return null;
  const [a, b, c, d, e, f] = values.map(Number);
  if ([a, b, c, d, e, f].some((value) => !Number.isFinite(value))) {
    return null;
  }
  return { a, b, c, d, e, f };
}

export function lerpMousePosition(
  currentMouse: MouseState,
  activeTarget: MouseState,
  deltaSeconds: number,
) {
  const response =
    1 - Math.exp(-ANIMATION_CONFIG.pointerResponse * deltaSeconds);
  currentMouse.x += (activeTarget.x - currentMouse.x) * response;
  currentMouse.y += (activeTarget.y - currentMouse.y) * response;
}

export function getParallaxOffset(
  currentMouse: MouseState,
  center: MouseState,
) {
  return {
    x: (currentMouse.x - center.x) * ANIMATION_CONFIG.parallaxFactor,
    y: (currentMouse.y - center.y) * ANIMATION_CONFIG.parallaxFactor,
  };
}

export function getActiveMouseTarget({
  center,
  mouseActive,
  targetMouse,
}: {
  center: MouseState;
  mouseActive: boolean;
  targetMouse: MouseState;
}) {
  return mouseActive ? targetMouse : center;
}
