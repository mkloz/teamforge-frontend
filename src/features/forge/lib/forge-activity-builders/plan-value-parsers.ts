import type { AutoForgeExecutionInput } from "@/features/forge/lib/forge-execution-schema";

export function buildDateTime(planDate: string, planTime: string) {
  const timestamp = new Date(`${planDate}T${planTime}`);

  if (Number.isNaN(timestamp.getTime())) {
    throw new Error("Invalid forge plan date-time");
  }

  return timestamp.toISOString();
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
