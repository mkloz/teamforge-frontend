import type { Point } from "../voronoi-contract";

export function applyFrictionAndMove(
  point: Point,
  friction: number,
  frameScale: number,
) {
  const adjustedFriction = friction ** frameScale;
  point.vx *= adjustedFriction;
  point.vy *= adjustedFriction;
  point.x += point.vx * frameScale;
  point.y += point.vy * frameScale;
}
