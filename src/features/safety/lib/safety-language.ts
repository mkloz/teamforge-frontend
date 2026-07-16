import type {
  ContainmentContestStatus,
  ModerationAppealStatus,
  PublicReportOutcome,
  ReportCategory,
  ReportOutcomeReviewStatus,
  ReportPublicStatus,
} from "@/shared/schemas/safety";

export const REPORT_STATUS_LABELS: Record<ReportPublicStatus, string> = {
  RECEIVED: "Received",
  BEING_REVIEWED: "Being reviewed",
  NEEDS_INFORMATION: "More information needed",
  RESOLVED: "Resolved",
};

export const OUTCOME_REVIEW_STATUS_LABELS: Record<
  ReportOutcomeReviewStatus,
  string
> = {
  RECEIVED: "Received",
  REVIEWING: "Being reviewed",
  NEEDS_INFORMATION: "More information needed",
  RESOLVED: "Resolved",
  EXPIRED: "Expired",
};

export const APPEAL_STATUS_LABELS: Record<ModerationAppealStatus, string> = {
  RECEIVED: "Received",
  REVIEWING: "Being reviewed",
  UPHELD: "Action remains",
  MODIFIED: "Action changed",
  OVERTURNED: "Action removed",
  EXPIRED: "Expired",
};

export const CONTEST_STATUS_LABELS: Record<ContainmentContestStatus, string> = {
  RECEIVED: "Received",
  REVIEWING: "Being reviewed",
  UPHELD: "Restriction remains",
  RELEASED: "Restriction removed",
  EXPIRED: "Expired",
};

export const PUBLIC_OUTCOME_LABELS: Record<PublicReportOutcome, string> = {
  ACTION_TAKEN: "Action taken",
  NO_RULE_BREACH_FOUND: "No rule breach found",
  NOT_ENOUGH_INFORMATION: "Not enough information",
  REVIEW_COMPLETED: "Review completed",
};

export const ACCOUNT_ACTION_STATE_LABELS = {
  PENDING: "Pending",
  ACTIVE: "Active",
  EXPIRED: "Ended",
  REVERSED: "Removed",
  FAILED: "Not applied",
} as const;

export const RESTRICTION_STATE_LABELS = {
  ACTIVE: "Active",
  RELEASED: "Removed",
  EXPIRED: "Ended",
  FAILED: "Not applied",
} as const;

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  HARASSMENT: "Harassment",
  UNWANTED_SEXUAL_CONDUCT: "Unwanted sexual conduct",
  THREAT_OR_VIOLENCE: "Threats or violence",
  STALKING_OR_PRIVACY: "Stalking or privacy",
  SCAM_OR_FRAUD: "Scams or fraud",
  IMPERSONATION: "Impersonation",
  HATE_OR_DISCRIMINATION: "Hate or discrimination",
  SELF_HARM_CONCERN: "Concern about self-harm",
  UNDERAGE_SAFETY: "Underage safety",
  SPAM: "Spam",
  OTHER: "Something else",
};

export function formatSafetyDate(value: string | null | undefined) {
  if (!value) return null;

  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatCategory(category: ReportCategory | null | undefined) {
  if (!category) return "Safety report";
  return CATEGORY_LABELS[category];
}
