import { useCallback } from "react";

import type { LocationType } from "@/features/forge/lib/forge-contract";

import type { BaseFieldActionOptions } from "./types";

export function usePlanFieldActions({ setField }: BaseFieldActionOptions) {
  const setPlanName = useCallback(
    (value: string) => setField("planName", value),
    [setField],
  );
  const setPlanDescription = useCallback(
    (value: string) => setField("planDescription", value),
    [setField],
  );
  const setPlanDate = useCallback(
    (value: string) => setField("planDate", value),
    [setField],
  );
  const setPlanTime = useCallback(
    (value: string) => setField("planTime", value),
    [setField],
  );
  const setPlanLocation = useCallback(
    (value: string) => setField("planLocation", value),
    [setField],
  );
  const setPlanLocationCoordinates = useCallback(
    (lat: number | null, lng: number | null) => {
      setField("planLocationLat", lat);
      setField("planLocationLng", lng);
    },
    [setField],
  );
  const setLocationType = useCallback(
    (value: LocationType) => {
      setField("locationType", value);

      if (value !== "IN_PERSON") {
        setField("planLocationLat", null);
        setField("planLocationLng", null);
      }

      if (value === "TBD") {
        setField("planLocation", "");
      }
    },
    [setField],
  );
  const setPlanCost = useCallback(
    (value: "FREE" | "PAID") => {
      setField("planCost", value);

      if (value === "FREE") {
        setField("planCostAmount", "");
      }
    },
    [setField],
  );
  const setPlanCostAmount = useCallback(
    (value: string) => setField("planCostAmount", value),
    [setField],
  );
  const setPlanCostDetails = useCallback(
    (value: string) => setField("planCostDetails", value),
    [setField],
  );

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
