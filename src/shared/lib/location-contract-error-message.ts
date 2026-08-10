import { getApiErrorCode } from "@/shared/lib/api-error-message";

const LOCATION_CONTRACT_MESSAGES: Readonly<Record<string, string>> = {
  ACTIVITY_INVITE_AVAILABILITY_LOCAL_LOCATION_REQUIRED:
    "Local invite availability needs private coordinates. Add your location in account settings, then try again.",
  AUTOMATIC_GROUP_FORMATION_REQUEST_LOCATION_REVIEW_REQUIRED:
    "Review this local plan's location. Add private coordinates or switch the request to Online.",
  AVAILABILITY_LOCAL_LOCATION_REQUIRED:
    "Local proposals need private coordinates. Add your location in account settings, then try again.",
  LOCAL_FORMATION_LOCATION_REQUIRED:
    "Keep a saved location while local group formation is active. Pause local proposals and any current local request before clearing it.",
  PROFILE_LOCATION_COORDINATES_REQUIRED:
    "Use the location button to add both private coordinates, or clear the location and coordinates together.",
};

export function getLocationContractErrorMessage(error: unknown) {
  const code = getApiErrorCode(error);
  return code ? (LOCATION_CONTRACT_MESSAGES[code] ?? null) : null;
}
