import type { FixedGroupSize } from "@/features/forge/lib/forge-contract";

const MIN_GROUP_SIZE = 2;
const MAX_GROUP_SIZE = 8;
const FIXED_GROUP_SIZES = [2, 3, 4, 5, 6, 7, 8] as const;

export const DEFAULT_GROUP_SIZE = 6 satisfies FixedGroupSize;

export function normalizeFixedGroupSize(value: number): FixedGroupSize {
  const normalized = Math.round(value);
  const clamped = Math.min(
    MAX_GROUP_SIZE,
    Math.max(MIN_GROUP_SIZE, normalized),
  );

  return FIXED_GROUP_SIZES[clamped - MIN_GROUP_SIZE];
}
