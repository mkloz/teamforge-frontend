export function getTelemetryErrorName(error: unknown) {
  return error instanceof Error ? error.name : "UnknownError";
}

export function getTelemetryErrorCode(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return undefined;
}
