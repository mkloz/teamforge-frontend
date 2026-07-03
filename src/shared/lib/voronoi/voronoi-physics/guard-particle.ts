import { GUARD_OFFSETS, NUM_CORE } from "@/shared/constants/voronoi.constants";
import type { Point } from "../voronoi-contract";
import { applyFrictionAndMove } from "./motion";
import type { ParticlePhysicsState } from "./types";

export function updateGuardParticle({
  index,
  physicsState,
  point,
  time,
}: {
  index: number;
  physicsState: ParticlePhysicsState;
  point: Point;
  time: number;
}) {
  const { targetX, targetY } = getGuardTarget({
    index,
    physicsState,
    time,
  });

  point.vx += (targetX - point.x) * 0.03;
  point.vy += (targetY - point.y) * 0.03;
  applyFrictionAndMove(point, 0.9);
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
  const breathX = Math.cos(time * 0.8 + index) * 10;
  const breathY = Math.sin(time * 0.6 + index) * 10;
  const guardOffset = GUARD_OFFSETS[index - NUM_CORE];

  return {
    targetX:
      physicsState.driftingCenterX +
      guardOffset.x * physicsState.guardSize +
      breathX,
    targetY:
      physicsState.driftingCenterY +
      guardOffset.y * physicsState.guardSize +
      breathY,
  };
}
