import type { Plan } from "@/features/activity/lib/activity-contract";

export const PLAN_PROPOSAL_FIELD_OPTIONS = [
  { value: "TITLE", label: "Title" },
  { value: "DESCRIPTION", label: "Description" },
  { value: "DATE_TIME", label: "Date & Time" },
  { value: "LOCATION", label: "Location" },
] as const;

export type ProposalField =
  (typeof PLAN_PROPOSAL_FIELD_OPTIONS)[number]["value"];

export function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getCurrentProposalValue(plan: Plan, field: ProposalField) {
  switch (field) {
    case "TITLE":
      return plan.title;
    case "DESCRIPTION":
      return plan.description ?? "";
    case "DATE_TIME":
      return toDateTimeLocalValue(plan.dateTime);
    case "LOCATION":
      return plan.location ?? "";
  }
}

export function normalizeProposedValue(field: ProposalField, value: string) {
  if (field === "DATE_TIME") {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  return value.trim();
}
