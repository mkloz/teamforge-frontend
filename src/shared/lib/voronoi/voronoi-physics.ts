import {
  ANIMATION_CONFIG,
  CORE_ANGLES,
  GUARD_OFFSETS,
  NUM_CORE,
  NUM_GUARD,
} from "@/shared/constants/voronoi.constants";
import type { Dimensions, Point } from "./voronoi-contract";

export function updateParticlePhysics({
  points,
  time,
  currentProgress,
  isTyping,
  dimensions,
  mouseX,
  mouseY,
  mouseActive,
}: {
  points: Point[];
  time: number;
  currentProgress: number;
  isTyping: boolean;
  dimensions: Dimensions;
  mouseX: number;
  mouseY: number;
  mouseActive: boolean;
}) {
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  const driftingCenterX =
    centerX +
    Math.cos(time * 0.3) * ANIMATION_CONFIG.driftRadius +
    Math.sin(time * 0.4) * (ANIMATION_CONFIG.driftRadius * 0.5);
  const driftingCenterY =
    centerY -
    30 +
    Math.sin(time * 0.35) * ANIMATION_CONFIG.driftRadius +
    Math.cos(time * 0.45) * (ANIMATION_CONFIG.driftRadius * 0.5);

  const guardSize =
    Math.min(dimensions.width, dimensions.height) *
      (0.44 - currentProgress * 0.15) *
      0.53 +
    Math.sin(time * 0.4) * 3.5;
  const exclusionRadius =
    Math.min(dimensions.width, dimensions.height) *
    (0.35 + currentProgress * 0.15) *
    0.35;
  const easedProgress = 1 - (1 - currentProgress) ** 2;
  const sparkPhase =
    currentProgress > 0.85 ? Math.min((currentProgress - 0.85) / 0.15, 1) : 0;
  const breathStrength = 1 - sparkPhase;

  let coreAvgX = 0;
  let coreAvgY = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];

    if (i < NUM_CORE) {
      const spreadX = centerX * 0.65;
      const spreadY = centerY * 0.65;
      const cornerX = centerX + (i % 2 === 0 ? -spreadX : spreadX);
      const cornerY = centerY + (Math.floor(i / 2) === 0 ? -spreadY : spreadY);

      const angle = CORE_ANGLES[i] + Math.sin(time * 0.6 + i * 2.1) * 0.2;
      const finalX = driftingCenterX + Math.cos(angle) * 27;
      const finalY = driftingCenterY + Math.sin(angle) * 27;

      const targetX = cornerX + (finalX - cornerX) * easedProgress;
      const targetY = cornerY + (finalY - cornerY) * easedProgress;

      p.vx += (targetX - p.x) * 0.01;
      p.vy += (targetY - p.y) * 0.01;

      const rnd =
        (isTyping && currentProgress < 0.9 ? 1.5 : 0.2) * breathStrength;
      p.vx += (Math.random() - 0.5) * 0.1 * rnd;
      p.vy += (Math.random() - 0.5) * 0.1 * rnd;

      p.vx *= 0.92;
      p.vy *= 0.92;
      p.x += p.vx;
      p.y += p.vy;

      coreAvgX += p.x;
      coreAvgY += p.y;
    } else if (i < NUM_CORE + NUM_GUARD) {
      const breathX = Math.cos(time * 0.8 + i) * 10;
      const breathY = Math.sin(time * 0.6 + i) * 10;
      const targetX =
        driftingCenterX + GUARD_OFFSETS[i - NUM_CORE].x * guardSize + breathX;
      const targetY =
        driftingCenterY + GUARD_OFFSETS[i - NUM_CORE].y * guardSize + breathY;

      p.vx += (targetX - p.x) * 0.03;
      p.vy += (targetY - p.y) * 0.03;
      p.vx *= 0.9;
      p.vy *= 0.9;
      p.x += p.vx;
      p.y += p.vy;
    } else {
      if (Math.random() < 0.02) {
        p.targetX += (Math.random() - 0.5) * 15;
        p.targetY += (Math.random() - 0.5) * 15;
      }

      const txDx = p.targetX - driftingCenterX;
      const tyDy = p.targetY - driftingCenterY;
      const tDist = Math.sqrt(txDx * txDx + tyDy * tyDy);

      if (tDist < exclusionRadius && tDist > 0) {
        const push =
          (exclusionRadius - tDist) * 0.05 * Math.max(0.1, currentProgress);
        p.targetX += (txDx / tDist) * push;
        p.targetY += (tyDy / tDist) * push;
      }

      if (p.targetX < -dimensions.width * 0.1) p.targetX += 5;
      if (p.targetX > dimensions.width * 1.1) p.targetX -= 5;
      if (p.targetY < -dimensions.height * 0.1) p.targetY += 5;
      if (p.targetY > dimensions.height * 1.1) p.targetY -= 5;

      p.vx += (p.targetX - p.x) * ANIMATION_CONFIG.springConstant;
      p.vy += (p.targetY - p.y) * ANIMATION_CONFIG.springConstant;

      const mDistX = p.x - mouseX;
      const mDistY = p.y - mouseY;
      const mDist = Math.sqrt(mDistX * mDistX + mDistY * mDistY);

      if (
        mDist < ANIMATION_CONFIG.repulsionRadius &&
        mDist > 0 &&
        mouseActive
      ) {
        const push =
          (1 - mDist / ANIMATION_CONFIG.repulsionRadius) ** 2 *
          ANIMATION_CONFIG.repulsionForce;
        p.vx += (mDistX / mDist) * push;
        p.vy += (mDistY / mDist) * push;
      }

      p.vx *= ANIMATION_CONFIG.friction;
      p.vy *= ANIMATION_CONFIG.friction;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  return {
    coreAvg: { x: coreAvgX / NUM_CORE, y: coreAvgY / NUM_CORE },
    sparkPhase,
  };
}
