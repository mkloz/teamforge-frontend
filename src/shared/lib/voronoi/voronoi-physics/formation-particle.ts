import type { Point, VoronoiFormationLayout } from "../voronoi-contract";
import { applyFrictionAndMove } from "./motion";
import type { ParticlePhysicsState } from "./types";

export function updateFormationParticle({
  frameScale,
  index,
  isTyping,
  formation,
  physicsState,
  point,
  settleInstantly,
  time,
}: {
  frameScale: number;
  index: number;
  isTyping: boolean;
  formation: VoronoiFormationLayout;
  physicsState: ParticlePhysicsState;
  point: Point;
  settleInstantly: boolean;
  time: number;
}) {
  const target = formation.positions[index] ?? formation.center;
  const targetX =
    point.targetX + (target.x - point.targetX) * physicsState.easedProgress;
  const targetY =
    point.targetY + (target.y - point.targetY) * physicsState.easedProgress;
  const breath = physicsState.breathStrength * (isTyping ? 1.4 : 0.55);
  const breathingX = Math.cos(time * 0.7 + index * 1.7) * breath;
  const breathingY = Math.sin(time * 0.62 + index * 1.3) * breath;

  if (settleInstantly) {
    point.x = targetX;
    point.y = targetY;
    point.vx = 0;
    point.vy = 0;
    return;
  }

  point.vx += (targetX + breathingX - point.x) * 0.013 * frameScale;
  point.vy += (targetY + breathingY - point.y) * 0.013 * frameScale;
  applyFrictionAndMove(point, 0.89, frameScale);
}
