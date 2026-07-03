import { NUM_CORE, NUM_GUARD } from "@/shared/constants/voronoi.constants";
import type { Dimensions, Point } from "./voronoi-contract";
import { updateAmbientParticle } from "./voronoi-physics/ambient-particle";
import { updateCoreParticle } from "./voronoi-physics/core-particle";
import { updateGuardParticle } from "./voronoi-physics/guard-particle";
import { getParticlePhysicsState } from "./voronoi-physics/physics-state";

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
  const physicsState = getParticlePhysicsState({
    currentProgress,
    dimensions,
    time,
  });
  const mouseState = {
    mouseActive,
    mouseX,
    mouseY,
  };

  let coreAvgX = 0;
  let coreAvgY = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];

    if (isCoreParticle(i)) {
      updateCoreParticle({
        currentProgress,
        index: i,
        isTyping,
        physicsState,
        point: p,
        time,
      });

      coreAvgX += p.x;
      coreAvgY += p.y;
    } else if (isGuardParticle(i)) {
      updateGuardParticle({
        index: i,
        physicsState,
        point: p,
        time,
      });
    } else {
      updateAmbientParticle({
        currentProgress,
        dimensions,
        mouseState,
        physicsState,
        point: p,
      });
    }
  }

  return {
    coreAvg: { x: coreAvgX / NUM_CORE, y: coreAvgY / NUM_CORE },
    sparkPhase: physicsState.sparkPhase,
  };
}

function isCoreParticle(index: number) {
  return index < NUM_CORE;
}

function isGuardParticle(index: number) {
  return index < NUM_CORE + NUM_GUARD;
}
