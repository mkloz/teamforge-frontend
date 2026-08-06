import { getApiErrorCode } from "@/shared/lib/api-error-message";

const ACCOUNT_EXISTS_CODE = "AUTH_ACCOUNT_EXISTS";
const GOOGLE_ACCOUNT_EXISTS_CODE = "AUTH_ACCOUNT_EXISTS_GOOGLE";

export type RegistrationAccountRecovery = "google" | "login";

export function getRegistrationAccountRecovery(
  error: unknown,
): RegistrationAccountRecovery | null {
  const code = getApiErrorCode(error);

  if (code === GOOGLE_ACCOUNT_EXISTS_CODE) {
    return "google";
  }

  return code === ACCOUNT_EXISTS_CODE ? "login" : null;
}
