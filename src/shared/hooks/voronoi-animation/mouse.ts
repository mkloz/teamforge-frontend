import { ANIMATION_CONFIG } from "@/shared/constants/voronoi.constants";
import type { MouseState } from "@/shared/lib/voronoi/voronoi-contract";

const RAD = 25 * (Math.PI / 180);
const COS_RAD = Math.cos(RAD);
const SIN_RAD = Math.sin(RAD);

export const INITIAL_MOUSE_POSITION = { x: -1000, y: -1000 } as const;

export function getRotatedMousePosition(
  targetMouse: MouseState,
  center: MouseState,
) {
  const targetDeltaX = targetMouse.x - center.x;
  const targetDeltaY = targetMouse.y - center.y;

  return {
    x: center.x + targetDeltaX * COS_RAD - targetDeltaY * SIN_RAD,
    y: center.y + targetDeltaX * SIN_RAD + targetDeltaY * COS_RAD,
  };
}

export function lerpMousePosition(
  currentMouse: MouseState,
  activeTarget: MouseState,
) {
  currentMouse.x +=
    (activeTarget.x - currentMouse.x) * ANIMATION_CONFIG.lerpRate;
  currentMouse.y +=
    (activeTarget.y - currentMouse.y) * ANIMATION_CONFIG.lerpRate;
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
