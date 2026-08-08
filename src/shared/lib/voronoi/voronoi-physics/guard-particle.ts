import { NUM_FORMATION, NUM_GUARD } from "@/shared/constants/voronoi.constants";
import type { Point } from "../voronoi-contract";
import { applyFrictionAndMove } from "./motion";
import type { ParticlePhysicsState } from "./types";

export function updateGuardParticle({
  frameScale,
  index,
  physicsState,
  point,
  settleInstantly,
  time,
}: {
  frameScale: number;
  index: number;
  physicsState: ParticlePhysicsState;
  point: Point;
  settleInstantly: boolean;
  time: number;
}) {
  const { targetX, targetY } = getGuardTarget({
    index,
    physicsState,
    time,
  });

  if (settleInstantly) {
    point.x = targetX;
    point.y = targetY;
    point.vx = 0;
    point.vy = 0;
    return;
  }

  point.vx += (targetX - point.x) * 0.03 * frameScale;
  point.vy += (targetY - point.y) * 0.03 * frameScale;
  applyFrictionAndMove(point, 0.9, frameScale);
}

function getGuardTarget({
  index,
  physicsState,
  time,
}: {
  index: number;
  physicsState: ParticlePhysicsState;
  time: number;
}) {
  const guardIndex = index - NUM_FORMATION;
  const ringCount = NUM_GUARD / 2;
  const ringIndex = guardIndex % ringCount;
  const ring = Math.floor(guardIndex / ringCount);
  const angle = ((ringIndex + ring * 0.5) / ringCount) * Math.PI * 2;
  const radiusScale = ring === 0 ? 1 : 1.62;
  const breathX = Math.cos(time * 0.8 + index) * 2.5;
  const breathY = Math.sin(time * 0.6 + index) * 2.5;

  return {
    targetX:
      physicsState.driftingCenterX +
      Math.cos(angle) * physicsState.guardRadiusX * radiusScale +
      breathX,
    targetY:
      physicsState.driftingCenterY +
      Math.sin(angle) * physicsState.guardRadiusY * radiusScale +
      breathY,
  };
}
