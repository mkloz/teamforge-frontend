import type { CapacityDisplayState } from "./types";

const CAPACITY_SEGMENT_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export function getCapacityDisplayState(
  memberCount: number,
  maxMembers: number,
): CapacityDisplayState {
  const visibleCapacitySegments = Math.max(1, Math.min(maxMembers, 8));

  return {
    capacitySegments: CAPACITY_SEGMENT_KEYS.slice(0, visibleCapacitySegments),
    filledCapacitySegments: Math.min(memberCount, visibleCapacitySegments),
  };
}
