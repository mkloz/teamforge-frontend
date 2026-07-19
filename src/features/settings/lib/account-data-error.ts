export const RECENT_AUTH_REQUIRED_CODE = "ACCOUNT_DATA_RECENT_AUTH_REQUIRED";

export function getAccountDataErrorCode(error: unknown) {
  if (
    !(error instanceof Error) ||
    !error.cause ||
    typeof error.cause !== "object"
  ) {
    return null;
  }

  if (!("code" in error.cause) || typeof error.cause.code !== "string") {
    return null;
  }

  return error.cause.code;
}
