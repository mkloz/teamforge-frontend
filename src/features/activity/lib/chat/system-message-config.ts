export type SystemMessageTone = "error" | "info" | "success" | "warning";
export type SystemMessageKind =
  | "cancelled"
  | "confirmed"
  | "declined"
  | "details"
  | "invite"
  | "location"
  | "member"
  | "rescheduled"
  | "time"
  | "default";

const ERROR_TERMS = [
  "cancelled",
  "canceled",
  "declined",
  "deleted",
  "disbanded",
  "failed",
  "removed",
  "rejected",
] as const;

const WARNING_TERMS = [
  "changed",
  "left",
  "pending",
  "proposed",
  "requested",
  "rescheduled",
] as const;

const SUCCESS_TERMS = [
  "accepted",
  "approved",
  "completed",
  "confirmed",
  "formed",
  "joined",
  "ready",
] as const;

const USER_EVENT_TERMS = ["added", "invited"] as const;

export function getSystemMessageConfig(content: string) {
  const normalized = content.toLowerCase();
  const planKind = getPlanSystemKind(normalized);

  if (matchesAnyTerm(normalized, ERROR_TERMS)) {
    return {
      tone: "error" as const,
      kind: matchesAnyTerm(normalized, ["declined", "rejected", "failed"])
        ? ("declined" as const)
        : ("cancelled" as const),
    };
  }

  if (matchesAnyTerm(normalized, WARNING_TERMS)) {
    return { tone: "warning" as const, kind: planKind ?? "details" };
  }

  if (matchesAnyTerm(normalized, SUCCESS_TERMS)) {
    return {
      tone: "success" as const,
      kind: matchesAnyTerm(normalized, ["joined", "formed"])
        ? ("member" as const)
        : (planKind ?? "confirmed"),
    };
  }

  if (matchesAnyTerm(normalized, USER_EVENT_TERMS)) {
    return { tone: "info" as const, kind: "invite" as const };
  }

  return { tone: "info" as const, kind: planKind ?? "default" };
}

function getPlanSystemKind(
  normalizedContent: string,
): SystemMessageKind | null {
  if (matchesAnyTerm(normalizedContent, ["rescheduled"])) {
    return "rescheduled";
  }

  if (
    matchesAnyTerm(normalizedContent, ["location", "place", "venue", "where"])
  ) {
    return "location";
  }

  if (matchesAnyTerm(normalizedContent, ["date", "time", "when"])) {
    return "time";
  }

  if (matchesAnyTerm(normalizedContent, ["detail", "proposal"])) {
    return "details";
  }

  return null;
}

function matchesAnyTerm(
  normalizedContent: string,
  terms: readonly string[],
): boolean {
  return terms.some((term) => normalizedContent.includes(term));
}
