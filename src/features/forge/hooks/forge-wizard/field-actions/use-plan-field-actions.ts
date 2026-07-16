import type {
  ForgeScope,
  LocationType,
  PlanScheduleMode,
} from "@/features/forge/lib/forge-contract";

import type { BaseFieldActionOptions } from "./types";

export function usePlanFieldActions({ setField }: BaseFieldActionOptions) {
  function setPlanName(value: string) {
    setField("planName", value);
  }

  function setPlanDescription(value: string) {
    setField("planDescription", value);
  }

  function setPlanDate(value: string) {
    setField("planDate", value);
  }

  function setPlanTime(value: string) {
    setField("planTime", value);
  }

  function setPlanScheduleMode(value: PlanScheduleMode) {
    setField("planScheduleMode", value);

    if (value === "TO_BE_DECIDED") {
      setField("planDate", "");
      setField("planTime", "");
    }
  }

  function setForgeScope(value: ForgeScope) {
    setField("forgeScope", value);
    setField("locationType", "TBD");
    setField("planLocation", "");
    setField("planLocationLat", null);
    setField("planLocationLng", null);
  }

  function setPlanLocation(value: string) {
    setField("planLocation", value);
  }

  function setPlanLocationCoordinates(lat: number | null, lng: number | null) {
    setField("planLocationLat", lat);
    setField("planLocationLng", lng);
  }

  function setLocationType(value: LocationType) {
    setField("locationType", value);

    if (value !== "IN_PERSON") {
      setField("planLocationLat", null);
      setField("planLocationLng", null);
    }

    if (value === "TBD") {
      setField("planLocation", "");
    }
  }

  function setPlanCost(value: "FREE" | "PAID") {
    setField("planCost", value);

    if (value === "FREE") {
      setField("planCostAmount", "");
    }
  }

  function setPlanCostAmount(value: string) {
    setField("planCostAmount", value);
  }

  function setPlanCostDetails(value: string) {
    setField("planCostDetails", value);
  }

  return {
    setForgeScope,
    setLocationType,
    setPlanCost,
    setPlanCostAmount,
    setPlanCostDetails,
    setPlanDate,
    setPlanDescription,
    setPlanLocation,
    setPlanLocationCoordinates,
    setPlanScheduleMode,
    setPlanName,
    setPlanTime,
  };
}
