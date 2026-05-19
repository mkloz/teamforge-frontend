import type { FixedGroupSize } from "@/features/forge/lib/forge-contract";

const MIN_GROUP_SIZE = 2;
const MAX_GROUP_SIZE = 8;
const FIXED_GROUP_SIZES = [2, 3, 4, 5, 6, 7, 8] as const;

export const DEFAULT_GROUP_SIZE = 6 satisfies FixedGroupSize;

export interface GroupSizeRange {
  max: FixedGroupSize;
  min: FixedGroupSize;
}

export function normalizeFixedGroupSize(value: number): FixedGroupSize {
  const normalized = Number.isFinite(value)
    ? Math.round(value)
    : DEFAULT_GROUP_SIZE;
  const clamped = Math.min(
    MAX_GROUP_SIZE,
    Math.max(MIN_GROUP_SIZE, normalized),
  );

  return FIXED_GROUP_SIZES[clamped - MIN_GROUP_SIZE] ?? DEFAULT_GROUP_SIZE;
}

export function normalizeGroupSizeRange(
  minSize: number,
  maxSize: number,
): GroupSizeRange {
  if (!Number.isFinite(minSize) && !Number.isFinite(maxSize)) {
    return {
      max: DEFAULT_GROUP_SIZE,
      min: DEFAULT_GROUP_SIZE,
    };
  }

  const normalizedMin = Number.isFinite(minSize)
    ? normalizeFixedGroupSize(minSize)
    : normalizeFixedGroupSize(maxSize);
  const normalizedMax = Number.isFinite(maxSize)
    ? normalizeFixedGroupSize(maxSize)
    : normalizeFixedGroupSize(minSize);

  return normalizedMin <= normalizedMax
    ? { max: normalizedMax, min: normalizedMin }
    : { max: normalizedMin, min: normalizedMax };
}

export function getPreferredGroupSizeFromRange(
  minSize: number,
  maxSize: number,
) {
  const range = normalizeGroupSizeRange(minSize, maxSize);

  return normalizeFixedGroupSize((range.min + range.max) / 2);
}
