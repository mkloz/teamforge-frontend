import { getHttpErrorStatus } from "@/shared/lib/api-error-message";

export const OPERATOR_CONTROL_ERROR_KINDS = [
  "MODEL_CONFLICT",
  "STALE_VERSION",
  "STALE_SESSION",
  "ACCESS_ENDED",
  "CONFLICT",
  "NOT_FOUND",
  "UNKNOWN",
] as const;

export type OperatorControlErrorKind =
  (typeof OPERATOR_CONTROL_ERROR_KINDS)[number];

const MODEL_CONFLICT_MESSAGES = new Set([
  "Evaluation provenance does not match the configuration snapshot",
  "Evaluation results must use the current corpus and complete provenance",
]);
const STALE_VERSION_MESSAGES = new Set([
  "Configuration state changed; refresh and try again",
  "Active configuration changed; refresh and try again",
  "Pilot operations coverage changed; refresh and try again",
]);
const STALE_SESSION_MESSAGES = new Set([
  "Recent operator authentication is required",
  "Recent step-up authentication is required",
]);

export function getOperatorControlErrorKind(
  error: unknown,
): OperatorControlErrorKind {
  const status = getHttpErrorStatus(error);
  const message = error instanceof Error ? error.message : "";

  if (status === 400 && MODEL_CONFLICT_MESSAGES.has(message)) {
    return "MODEL_CONFLICT";
  }
  if (status === 409 && STALE_VERSION_MESSAGES.has(message)) {
    return "STALE_VERSION";
  }
  if (
    status === 401 ||
    (status === 403 && STALE_SESSION_MESSAGES.has(message))
  ) {
    return "STALE_SESSION";
  }
  if (status === 403) {
    return "ACCESS_ENDED";
  }
  if (status === 409) {
    return "CONFLICT";
  }
  if (status === 404) {
    return "NOT_FOUND";
  }
  return "UNKNOWN";
}
