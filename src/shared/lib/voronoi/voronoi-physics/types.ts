export type ParticlePhysicsState = {
  breathStrength: number;
  centerX: number;
  centerY: number;
  driftingCenterX: number;
  driftingCenterY: number;
  easedProgress: number;
  exclusionRadiusX: number;
  exclusionRadiusY: number;
  guardRadiusX: number;
  guardRadiusY: number;
  sparkPhase: number;
};

export type MousePhysicsState = {
  mouseActive: boolean;
  mouseX: number;
  mouseY: number;
};
