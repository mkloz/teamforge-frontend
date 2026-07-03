import type { Plan } from "@/features/activity/lib/activity-contract";
import { LOCATION_MODE_LABELS } from "@/features/activity/lib/plan-location";
import type {
  PlanLocationSelection,
  ProposalLocationValue,
} from "./plan-change-dialog-types";

export function getLocationValueFromSelection(
  current: ProposalLocationValue,
  location: PlanLocationSelection | null,
): ProposalLocationValue {
  if (!location) {
    return {
      ...current,
      location: "",
      locationLat: null,
      locationLng: null,
    };
  }

  return {
    ...current,
    location: location.address,
    locationLat: location.lat,
    locationLng: location.lng,
  };
}

export function getLocationValueFromLink(
  current: ProposalLocationValue,
  value: string,
): ProposalLocationValue {
  return {
    ...current,
    location: value,
    locationLat: null,
    locationLng: null,
  };
}

export function isPlanLocationMode(
  value: string,
): value is Plan["locationMode"] {
  return Object.keys(LOCATION_MODE_LABELS).some((mode) => mode === value);
}
