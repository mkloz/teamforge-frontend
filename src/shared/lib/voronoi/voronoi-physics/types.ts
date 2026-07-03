export type ParticlePhysicsState = {
  breathStrength: number;
  centerX: number;
  centerY: number;
  driftingCenterX: number;
  driftingCenterY: number;
  easedProgress: number;
  exclusionRadius: number;
  guardSize: number;
  sparkPhase: number;
};

export type MousePhysicsState = {
  mouseActive: boolean;
  mouseX: number;
  mouseY: number;
};
