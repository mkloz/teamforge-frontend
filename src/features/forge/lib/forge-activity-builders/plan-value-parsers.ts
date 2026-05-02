import type { AutoForgeExecutionInput } from "@/features/forge/api/forge-types";

export function buildDateTime(planDate: string, planTime: string) {
  if (!planDate || !planTime) {
    return null;
  }

  const timestamp = new Date(`${planDate}T${planTime}`);

  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}

export function getCoordinatePair(
  lat: number | null | undefined,
  lng: number | null | undefined,
) {
  return typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lng === "number" &&
    Number.isFinite(lng)
    ? { lat, lng }
    : null;
}

export function parseCostAmount(input: AutoForgeExecutionInput) {
  if (input.planCost !== "PAID") {
    return null;
  }

  const amount = Number(input.planCostAmount);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}
