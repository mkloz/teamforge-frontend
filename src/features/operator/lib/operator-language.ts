import type {
  OperatorCaseSummary,
  OperatorQueue,
} from "@/features/operator/schemas/operator.schemas";

export { OPERATOR_QUEUES } from "@/features/operator/schemas/operator.schemas";

export const OPERATOR_QUEUE_COPY: Record<
  OperatorQueue,
  { label: string; description: string }
> = {
  CRITICAL_NOW: {
    label: "Critical now",
    description: "Immediate safety risk or overdue urgent work",
  },
  HUMAN_REQUIRED: {
    label: "Human required",
    description: "Cases that require a person to make the next decision",
  },
  APPEALS: {
    label: "Appeals",
    description: "Account action appeals awaiting review",
  },
  CONTAINMENT_REVIEW: {
    label: "Containment review",
    description: "Temporary restrictions due for review",
  },
  ROUTINE: {
    label: "Routine",
    description: "Standard reports and follow-up work",
  },
  CAMPAIGNS_TRENDS: {
    label: "Campaigns and trends",
    description: "Cases linked by a server-owned campaign key",
  },
};

export const SEVERITY_LABELS: Record<
  NonNullable<OperatorCaseSummary["severity"]>,
  string
> = {
  P0: "Critical · P0",
  P1: "Urgent · P1",
  P2: "High · P2",
  P3: "Standard · P3",
  P4: "Low · P4",
};

export function humanizeCode(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./u, (letter) => letter.toUpperCase());
}

export function formatOperatorDate(value: string | null) {
  return value ? new Date(value).toLocaleString("en-GB") : "Not set";
}

export function isChildSafetyCase(
  policyLabels: string[],
  reportCategories: string[],
  mandatoryHumanReasons: string[],
) {
  return (
    reportCategories.includes("UNDERAGE_SAFETY") ||
    mandatoryHumanReasons.some(
      (reason) =>
        reason === "CHILD_SAFETY" || reason === "IDENTITY_OR_AGE_DISPUTE",
    ) ||
    policyLabels.some((label) => {
      const normalized = label.toUpperCase();
      return (
        normalized === "CHILD_SAFETY" ||
        normalized === "UNDERAGE_SAFETY" ||
        normalized === "CSAM" ||
        (normalized.includes("MINOR") && normalized.includes("SEXUAL"))
      );
    })
  );
}
