import { getHttpErrorStatus } from "@/shared/lib/api-error-message";

const NETWORK_ERROR_NAMES = new Set(["NetworkError", "TimeoutError"]);
const NETWORK_ERROR_MESSAGES = [
  "Failed to fetch",
  "Load failed",
  "Network request failed",
  "The Internet connection appears to be offline",
];

export function isApiNetworkError(error: unknown) {
  if (getHttpErrorStatus(error) !== null) {
    return false;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  if (NETWORK_ERROR_NAMES.has(error.name)) {
    return true;
  }

  return NETWORK_ERROR_MESSAGES.some((message) =>
    error.message.includes(message),
  );
}
