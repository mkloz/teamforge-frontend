import { z } from "zod";
import type { LocationMode } from "@/shared/schemas/enums";

export interface PlanLocationValue {
  location: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationMode: LocationMode;
}

export const PLAN_LOCATION_MODE_LABELS: Record<LocationMode, string> = {
  IN_PERSON: "In person",
  ONLINE: "Online",
  TBD: "TBD",
};

export type PlanLocationKeyOrder = "location-first" | "mode-first";

export interface NormalizePlanLocationValueOptions {
  coordinatePairMessage?: string;
  keyOrder?: PlanLocationKeyOrder;
  missingLocationMessage?: string;
  requireCoordinatePair?: boolean;
}

const planLocationPayloadSchema = z.object({
  location: z.string().nullable().optional(),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
  locationMode: z.enum(["IN_PERSON", "ONLINE", "TBD"]),
});

export function cleanPlanProposalText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function isPlanLocationMode(value: string): value is LocationMode {
  return Object.keys(PLAN_LOCATION_MODE_LABELS).some((mode) => mode === value);
}

export function normalizePlanLocationValue(
  value: Partial<PlanLocationValue> & { locationMode: LocationMode },
  options: NormalizePlanLocationValueOptions = {},
): PlanLocationValue {
  if (value.locationMode === "TBD") {
    return orderPlanLocationValue(
      {
        location: null,
        locationLat: null,
        locationLng: null,
        locationMode: "TBD",
      },
      options,
    );
  }

  const location = cleanPlanProposalText(value.location);

  if (!location) {
    throw new Error(options.missingLocationMessage ?? "Location is required.");
  }

  if (value.locationMode === "ONLINE") {
    return orderPlanLocationValue(
      {
        location,
        locationLat: null,
        locationLng: null,
        locationMode: "ONLINE",
      },
      options,
    );
  }

  const locationLat = value.locationLat ?? null;
  const locationLng = value.locationLng ?? null;

  if (
    options.requireCoordinatePair &&
    (locationLat === null) !== (locationLng === null)
  ) {
    throw new Error(
      options.coordinatePairMessage ?? "Coordinates must be provided together.",
    );
  }

  return orderPlanLocationValue(
    {
      location,
      locationLat,
      locationLng,
      locationMode: "IN_PERSON",
    },
    options,
  );
}

export function serializePlanLocationValue(
  value: PlanLocationValue,
  options: NormalizePlanLocationValueOptions = {},
) {
  return JSON.stringify(
    orderPlanLocationValue(normalizePlanLocationValue(value, options), options),
  );
}

export function parsePlanLocationValue(
  value: string | null,
  options: NormalizePlanLocationValueOptions = {},
) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed.startsWith("{")) {
    return null;
  }

  try {
    const parsed = planLocationPayloadSchema.safeParse(JSON.parse(trimmed));

    if (!parsed.success) {
      return null;
    }

    return normalizePlanLocationValue(
      {
        location: parsed.data.location ?? null,
        locationLat: parsed.data.locationLat ?? null,
        locationLng: parsed.data.locationLng ?? null,
        locationMode: parsed.data.locationMode,
      },
      options,
    );
  } catch {
    return null;
  }
}

export function formatPlanLocationValue(value: PlanLocationValue) {
  if (value.locationMode === "TBD") {
    return "Location TBD";
  }

  const location = cleanPlanProposalText(value.location);

  if (value.locationMode === "ONLINE") {
    return location ? `Online: ${location}` : "Online location TBD";
  }

  return location ?? "Location TBD";
}

function orderPlanLocationValue(
  value: PlanLocationValue,
  options: { keyOrder?: PlanLocationKeyOrder },
): PlanLocationValue {
  if (options.keyOrder === "mode-first") {
    return {
      locationMode: value.locationMode,
      location: value.location,
      locationLat: value.locationLat,
      locationLng: value.locationLng,
    };
  }

  return {
    location: value.location,
    locationLat: value.locationLat,
    locationLng: value.locationLng,
    locationMode: value.locationMode,
  };
}
