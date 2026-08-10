import { getHttpErrorStatus } from "@/shared/lib/api-error-message";

const NETWORK_ERROR_NAMES = new Set(["NetworkError", "TimeoutError"]);
const NETWORK_ERROR_MESSAGES = [
  "ERR_INTERNET_DISCONNECTED",
  "Failed to fetch",
  "Load failed",
  "Network request failed",
  "The Internet connection appears to be offline",
];

interface ErrorLike {
  message: string;
  name: string;
}

function readMessageProperty(value: object) {
  if (!("message" in value)) {
    return "";
  }

  return typeof value.message === "string" ? value.message : "";
}

function readNameProperty(value: object) {
  if (!("name" in value)) {
    return "";
  }

  return typeof value.name === "string" ? value.name : "";
}

function hasNetworkErrorName(errorLike: ErrorLike) {
  return NETWORK_ERROR_NAMES.has(errorLike.name);
}

function hasNetworkErrorMessage(errorLike: ErrorLike) {
  return NETWORK_ERROR_MESSAGES.some((message) =>
    errorLike.message.includes(message),
  );
}

function isErrorLikeObject(error: unknown): error is object {
  return Boolean(error) && typeof error === "object";
}

function hasErrorLikeText(errorLike: ErrorLike) {
  return Boolean(errorLike.name || errorLike.message);
}

function readObjectErrorLike(error: object) {
  const errorLike = {
    message: readMessageProperty(error),
    name: readNameProperty(error),
  };

  return hasErrorLikeText(errorLike) ? errorLike : null;
}

function readErrorLike(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
    };
  }

  if (!isErrorLikeObject(error)) {
    return null;
  }

  return readObjectErrorLike(error);
}

export function isApiNetworkError(error: unknown) {
  if (getHttpErrorStatus(error) !== null) {
    return false;
  }

  const errorLike = readErrorLike(error);

  if (!errorLike) {
    return false;
  }

  if (hasNetworkErrorName(errorLike)) {
    return true;
  }

  return hasNetworkErrorMessage(errorLike);
}
