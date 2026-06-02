import { getHttpErrorStatus } from "@/shared/lib/api-error-message";

const NETWORK_ERROR_NAMES = new Set(["NetworkError", "TimeoutError"]);
const NETWORK_ERROR_MESSAGES = [
  "ERR_INTERNET_DISCONNECTED",
  "Failed to fetch",
  "Load failed",
  "Network request failed",
  "The Internet connection appears to be offline",
];

function readErrorLike(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
    };
  }

  if (!error || typeof error !== "object") {
    return null;
  }

  const name =
    "name" in error && typeof error.name === "string" ? error.name : "";
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : "";

  if (!name && !message) {
    return null;
  }

  return { message, name };
}

export function isApiNetworkError(error: unknown) {
  if (getHttpErrorStatus(error) !== null) {
    return false;
  }

  const errorLike = readErrorLike(error);

  if (!errorLike) {
    return false;
  }

  if (NETWORK_ERROR_NAMES.has(errorLike.name)) {
    return true;
  }

  return NETWORK_ERROR_MESSAGES.some((message) =>
    errorLike.message.includes(message),
  );
}
