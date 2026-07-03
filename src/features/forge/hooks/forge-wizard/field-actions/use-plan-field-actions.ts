import type { LocationType } from "@/features/forge/lib/forge-contract";

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
    setLocationType,
    setPlanCost,
    setPlanCostAmount,
    setPlanCostDetails,
    setPlanDate,
    setPlanDescription,
    setPlanLocation,
    setPlanLocationCoordinates,
    setPlanName,
    setPlanTime,
  };
}
