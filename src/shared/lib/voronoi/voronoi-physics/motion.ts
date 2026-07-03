import type { Point } from "../voronoi-contract";

export function applyFrictionAndMove(point: Point, friction: number) {
  point.vx *= friction;
  point.vy *= friction;
  point.x += point.vx;
  point.y += point.vy;
}
