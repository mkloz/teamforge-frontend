import { describe, expect, it } from "vitest";

import { getLocationContractErrorMessage } from "@/shared/lib/location-contract-error-message";

describe("location contract errors", () => {
  it.each([
    [
      "PROFILE_LOCATION_COORDINATES_REQUIRED",
      "Use the location button to add both private coordinates, or clear the location and coordinates together.",
    ],
    [
      "LOCAL_FORMATION_LOCATION_REQUIRED",
      "Keep a saved location while local group formation is active. Pause local proposals and any current local request before clearing it.",
    ],
    [
      "AVAILABILITY_LOCAL_LOCATION_REQUIRED",
      "Local proposals need private coordinates. Add your location in account settings, then try again.",
    ],
    [
      "ACTIVITY_INVITE_AVAILABILITY_LOCAL_LOCATION_REQUIRED",
      "Local invite availability needs private coordinates. Add your location in account settings, then try again.",
    ],
    [
      "AUTOMATIC_GROUP_FORMATION_REQUEST_LOCATION_REVIEW_REQUIRED",
      "Review this local plan's location. Add private coordinates or switch the request to Online.",
    ],
  ])("maps only the frozen %s code", (code, message) => {
    expect(getLocationContractErrorMessage(apiError(code))).toBe(message);
  });

  it("does not alias unknown backend codes", () => {
    expect(
      getLocationContractErrorMessage(apiError("LOCATION_REQUIRED")),
    ).toBeNull();
  });
});

function apiError(code: string) {
  return Object.assign(
    new Error("Request failed", {
      cause: { code, status: 409 },
    }),
    { response: { status: 409 } },
  );
}
