import {
  GUARD_OFFSETS,
  NUM_CORE,
  NUM_GUARD,
} from "@/shared/constants/voronoi.constants";
import type { Dimensions, Point } from "@/shared/lib/voronoi/voronoi-contract";

type VoronoiPointRole = "ambient" | "core" | "guard";

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

function getVoronoiPointRole(index: number): VoronoiPointRole {
  if (index < NUM_CORE) {
    return "core";
  }

  if (index < NUM_CORE + NUM_GUARD) {
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
  if (role === "core") {
    return getCorePointStartPosition(index, dimensions);
  }

  if (role === "guard") {
    return getGuardPointStartPosition(index, dimensions);
  }

  return getRandomPointStartPosition(dimensions);
}

function getCorePointStartPosition(index: number, dimensions: Dimensions) {
  const spreadX = dimensions.width * 0.35;
  const spreadY = dimensions.height * 0.35;

  return {
    x: dimensions.width / 2 + getCoreColumnDirection(index) * spreadX,
    y: dimensions.height / 2 + getCoreRowDirection(index) * spreadY,
  };
}

function getCoreColumnDirection(index: number) {
  return index % 2 === 0 ? -1 : 1;
}

function getCoreRowDirection(index: number) {
  return Math.floor(index / 2) === 0 ? -1 : 1;
}

function getGuardPointStartPosition(index: number, dimensions: Dimensions) {
  const guardSize = Math.min(dimensions.width, dimensions.height) * 0.3;
  const guardOffset = GUARD_OFFSETS[index - NUM_CORE];

  return {
    x: dimensions.width / 2 + guardOffset.x * guardSize,
    y: dimensions.height / 2 + guardOffset.y * guardSize,
  };
}

function getRandomPointStartPosition(dimensions: Dimensions) {
  return {
    x: Math.random() * dimensions.width,
    y: Math.random() * dimensions.height,
  };
}

function getInitialVoronoiPointOpacity(role: VoronoiPointRole) {
  return role === "core"
    ? 0.2 + Math.random() * 0.3
    : 0.03 + Math.random() * 0.12;
}
