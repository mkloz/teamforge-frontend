type SystemMessageTone = "error" | "info" | "success" | "warning";
type SystemMessageKind =
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

interface SystemMessageConfig {
  kind: SystemMessageKind;
  tone: SystemMessageTone;
}

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
const DECLINED_ERROR_TERMS = ["declined", "rejected", "failed"] as const;
const MEMBER_SUCCESS_TERMS = ["joined", "formed"] as const;

const PLAN_KIND_RULES = [
  {
    kind: "rescheduled",
    terms: ["rescheduled"],
  },
  {
    kind: "location",
    terms: ["location", "place", "venue", "where"],
  },
  {
    kind: "time",
    terms: ["date", "time", "when"],
  },
  {
    kind: "details",
    terms: ["detail", "proposal"],
  },
] satisfies readonly {
  kind: SystemMessageKind;
  terms: readonly string[];
}[];

const SYSTEM_MESSAGE_CONFIG_RULES = [
  {
    getConfig: getErrorSystemMessageConfig,
    terms: ERROR_TERMS,
  },
  {
    getConfig: (
      _normalizedContent: string,
      planKind: SystemMessageKind | null,
    ) => getWarningSystemMessageConfig(planKind),
    terms: WARNING_TERMS,
  },
  {
    getConfig: getSuccessSystemMessageConfig,
    terms: SUCCESS_TERMS,
  },
  {
    getConfig: () => ({ tone: "info" as const, kind: "invite" as const }),
    terms: USER_EVENT_TERMS,
  },
] satisfies readonly {
  getConfig: (
    normalizedContent: string,
    planKind: SystemMessageKind | null,
  ) => SystemMessageConfig;
  terms: readonly string[];
}[];

export function getSystemMessageConfig(content: string) {
  const normalized = content.toLowerCase();
  const planKind = getPlanSystemKind(normalized);
  const configRule = SYSTEM_MESSAGE_CONFIG_RULES.find(({ terms }) =>
    matchesAnyTerm(normalized, terms),
  );

  if (configRule) {
    return configRule.getConfig(normalized, planKind);
  }

  return { tone: "info" as const, kind: planKind ?? "default" };
}

function getErrorSystemMessageConfig(
  normalizedContent: string,
): SystemMessageConfig {
  return {
    tone: "error",
    kind: matchesAnyTerm(normalizedContent, DECLINED_ERROR_TERMS)
      ? "declined"
      : "cancelled",
  };
}

function getWarningSystemMessageConfig(
  planKind: SystemMessageKind | null,
): SystemMessageConfig {
  return { tone: "warning", kind: planKind ?? "details" };
}

function getSuccessSystemMessageConfig(
  normalizedContent: string,
  planKind: SystemMessageKind | null,
): SystemMessageConfig {
  return {
    tone: "success",
    kind: matchesAnyTerm(normalizedContent, MEMBER_SUCCESS_TERMS)
      ? "member"
      : (planKind ?? "confirmed"),
  };
}

function getPlanSystemKind(
  normalizedContent: string,
): SystemMessageKind | null {
  return (
    PLAN_KIND_RULES.find(({ terms }) =>
      matchesAnyTerm(normalizedContent, terms),
    )?.kind ?? null
  );
}

function matchesAnyTerm(
  normalizedContent: string,
  terms: readonly string[],
): boolean {
  return terms.some((term) => normalizedContent.includes(term));
}
