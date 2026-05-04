import type { LocationMode } from "@/shared/schemas/enums";

export interface PlanLocationValue {
  location: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationMode: LocationMode;
}

export const LOCATION_MODE_LABELS: Record<LocationMode, string> = {
  IN_PERSON: "In person",
  ONLINE: "Online",
  TBD: "TBD",
};

function cleanLocation(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function isLocationMode(value: unknown): value is LocationMode {
  return value === "IN_PERSON" || value === "ONLINE" || value === "TBD";
}

export function normalizePlanLocationValue(
  value: Partial<PlanLocationValue> & { locationMode: LocationMode },
): PlanLocationValue {
  if (value.locationMode === "TBD") {
    return {
      locationMode: "TBD",
      location: null,
      locationLat: null,
      locationLng: null,
    };
  }

  const location = cleanLocation(value.location);

  if (!location) {
    throw new Error("Add a location before sending a proposal.");
  }

  if (value.locationMode === "ONLINE") {
    return {
      locationMode: "ONLINE",
      location,
      locationLat: null,
      locationLng: null,
    };
  }

  const locationLat = value.locationLat ?? null;
  const locationLng = value.locationLng ?? null;

  if ((locationLat === null) !== (locationLng === null)) {
    throw new Error("Coordinates must be provided together.");
  }

  return {
    locationMode: "IN_PERSON",
    location,
    locationLat,
    locationLng,
  };
}

export function serializePlanLocationValue(value: PlanLocationValue) {
  return JSON.stringify(normalizePlanLocationValue(value));
}

export function parsePlanLocationValue(value: string | null) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed.startsWith("{")) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as Partial<PlanLocationValue>;

    if (!isLocationMode(parsed.locationMode)) {
      return null;
    }

    return normalizePlanLocationValue({
      locationMode: parsed.locationMode,
      location: parsed.location ?? null,
      locationLat: parsed.locationLat ?? null,
      locationLng: parsed.locationLng ?? null,
    });
  } catch {
    return null;
  }
}

export function getPlanLocationValue(plan: PlanLocationValue) {
  return normalizePlanLocationValue(plan);
}

export function formatPlanLocation(value: PlanLocationValue) {
  if (value.locationMode === "TBD") {
    return "Location TBD";
  }

  const location = cleanLocation(value.location);

  if (value.locationMode === "ONLINE") {
    return location ? `Online: ${location}` : "Online location TBD";
  }

  return location ?? "Location TBD";
}

export function formatPlanLocationProposalValue(value: string | null) {
  const parsed = parsePlanLocationValue(value);

  if (parsed) {
    return formatPlanLocation(parsed);
  }

  return cleanLocation(value) ?? "Not set";
}
