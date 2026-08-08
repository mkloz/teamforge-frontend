import { NUM_FORMATION, NUM_GUARD } from "@/shared/constants/voronoi.constants";
import type { Dimensions, Point } from "@/shared/lib/voronoi/voronoi-contract";

type VoronoiPointRole = "ambient" | "formation" | "guard";

export function getCenterPoint(dimensions: Dimensions) {
  return {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
  };
}

export function createVoronoiPoint(
  index: number,
  dimensions: Dimensions,
): Point {
  const role = getVoronoiPointRole(index);
  const { x: startX, y: startY } = getVoronoiPointPosition({
    dimensions,
    index,
    role,
  });

  return {
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    targetX: startX,
    targetY: startY,
    opacity: getInitialVoronoiPointOpacity(role),
  };
}

export function resizeVoronoiPoints(
  points: Point[],
  previousDimensions: Dimensions,
  nextDimensions: Dimensions,
) {
  if (previousDimensions.width <= 0 || previousDimensions.height <= 0) {
    return;
  }

  const scaleX = nextDimensions.width / previousDimensions.width;
  const scaleY = nextDimensions.height / previousDimensions.height;

  for (const point of points) {
    point.x *= scaleX;
    point.y *= scaleY;
    point.targetX *= scaleX;
    point.targetY *= scaleY;
    point.vx *= scaleX;
    point.vy *= scaleY;
  }
}

function getVoronoiPointRole(index: number): VoronoiPointRole {
  if (index < NUM_FORMATION) {
    return "formation";
  }

  if (index < NUM_FORMATION + NUM_GUARD) {
    return "guard";
  }

  return "ambient";
}

function getVoronoiPointPosition({
  dimensions,
  index,
  role,
}: {
  dimensions: Dimensions;
  index: number;
  role: VoronoiPointRole;
}) {
  if (role === "formation") {
    return getFormationPointStartPosition(index, dimensions);
  }

  if (role === "guard") {
    return getGuardPointStartPosition(index, dimensions);
  }

  return getRandomPointStartPosition(dimensions, index);
}

function getFormationPointStartPosition(index: number, dimensions: Dimensions) {
  const columns = 16;
  const rows = Math.ceil(NUM_FORMATION / columns);
  const column = index % columns;
  const row = Math.floor(index / columns);
  const jitterX = (deterministicNoise(index, 17) - 0.5) * 0.56;
  const jitterY = (deterministicNoise(index, 29) - 0.5) * 0.56;

  return {
    x: dimensions.width * (0.05 + ((column + 0.5 + jitterX) / columns) * 0.9),
    y: dimensions.height * (0.05 + ((row + 0.5 + jitterY) / rows) * 0.9),
  };
}

function getGuardPointStartPosition(index: number, dimensions: Dimensions) {
  const guardIndex = index - NUM_FORMATION;
  const ringCount = NUM_GUARD / 2;
  const ringIndex = guardIndex % ringCount;
  const ring = Math.floor(guardIndex / ringCount);
  const angle = ((ringIndex + ring * 0.5) / ringCount) * Math.PI * 2;
  const guardRadius =
    Math.min(dimensions.width, dimensions.height) * (ring === 0 ? 0.22 : 0.34);

  return {
    x: dimensions.width / 2 + Math.cos(angle) * guardRadius,
    y: dimensions.height / 2 + Math.sin(angle) * guardRadius,
  };
}

function getRandomPointStartPosition(
  dimensions: Dimensions,
  index = NUM_FORMATION + NUM_GUARD,
) {
  return {
    x: deterministicNoise(index, 41) * dimensions.width,
    y: deterministicNoise(index, 73) * dimensions.height,
  };
}

function getInitialVoronoiPointOpacity(role: VoronoiPointRole) {
  return role === "formation" ? 0.055 : 0.035;
}

function deterministicNoise(index: number, salt: number) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43_758.5453;
  return value - Math.floor(value);
}
