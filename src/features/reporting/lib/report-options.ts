import type {
  ReportCategory,
  ReportTargetType,
} from "@/features/reporting/schemas/report.schemas";

export interface ReportTarget {
  id: string;
  label: string;
  relatedMessageIds?: readonly string[];
  type: ReportTargetType;
}

export const REPORT_CATEGORY_OPTIONS = [
  ["HARASSMENT", "Harassment"],
  ["UNWANTED_SEXUAL_CONDUCT", "Unwanted sexual conduct"],
  ["THREAT_OR_VIOLENCE", "Threats or violence"],
  ["STALKING_OR_PRIVACY", "Stalking or privacy"],
  ["SCAM_OR_FRAUD", "Scams or fraud"],
  ["IMPERSONATION", "Impersonation"],
  ["HATE_OR_DISCRIMINATION", "Hate or discrimination"],
  ["SELF_HARM_CONCERN", "Concern about self-harm"],
  ["UNDERAGE_SAFETY", "Underage safety"],
  ["SPAM", "Spam"],
  ["OTHER", "Something else"],
] as const satisfies readonly (readonly [ReportCategory, string])[];

export const URGENT_REPORT_CATEGORIES = new Set<ReportCategory>([
  "THREAT_OR_VIOLENCE",
  "STALKING_OR_PRIVACY",
  "SELF_HARM_CONCERN",
  "UNDERAGE_SAFETY",
]);

export const REPORT_STATUS_LABELS = {
  RECEIVED: "Received",
  BEING_REVIEWED: "Being reviewed",
  NEEDS_INFORMATION: "More information needed",
  RESOLVED: "Resolved",
} as const;
