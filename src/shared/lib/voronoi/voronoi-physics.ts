import { NUM_FORMATION, NUM_GUARD } from "@/shared/constants/voronoi.constants";
import type {
  Dimensions,
  Point,
  VoronoiFormationLayout,
} from "./voronoi-contract";
import { updateAmbientParticle } from "./voronoi-physics/ambient-particle";
import { updateFormationParticle } from "./voronoi-physics/formation-particle";
import { updateGuardParticle } from "./voronoi-physics/guard-particle";
import { getParticlePhysicsState } from "./voronoi-physics/physics-state";

export function updateParticlePhysics({
  points,
  time,
  currentProgress,
  isTyping,
  dimensions,
  formation,
  frameScale,
  mouseX,
  mouseY,
  mouseActive,
  settleInstantly = false,
}: {
  points: Point[];
  time: number;
  currentProgress: number;
  isTyping: boolean;
  dimensions: Dimensions;
  formation: VoronoiFormationLayout;
  frameScale: number;
  mouseX: number;
  mouseY: number;
  mouseActive: boolean;
  settleInstantly?: boolean;
}) {
  const physicsState = getParticlePhysicsState({
    currentProgress,
    dimensions,
    formation,
    time,
  });
  const mouseState = {
    mouseActive,
    mouseX,
    mouseY,
  };

  for (let i = 0; i < points.length; i++) {
    const p = points[i];

    if (isFormationParticle(i)) {
      updateFormationParticle({
        frameScale,
        index: i,
        isTyping,
        formation,
        physicsState,
        point: p,
        settleInstantly,
        time,
      });
    } else if (isGuardParticle(i)) {
      updateGuardParticle({
        frameScale,
        index: i,
        physicsState,
        point: p,
        settleInstantly,
        time,
      });
    } else {
      updateAmbientParticle({
        currentProgress,
        dimensions,
        frameScale,
        mouseState,
        physicsState,
        point: p,
        settleInstantly,
      });
    }
  }

  return {
    formationCenter: {
      x: physicsState.driftingCenterX,
      y: physicsState.driftingCenterY,
    },
    particlePhase: physicsState.particlePhase,
  };
}

function isFormationParticle(index: number) {
  return index < NUM_FORMATION;
}

function isGuardParticle(index: number) {
  return index < NUM_FORMATION + NUM_GUARD;
}
