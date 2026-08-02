import type { GroupIdentityFormValues } from "@/features/activity/hooks/group-identity/group-identity-form-state/types";
import { buildCanonicalPlanScheduleInput } from "@/shared/lib/plan-schedule";

export function normalizeCostAmount(values: GroupIdentityFormValues) {
  if (values.planCost !== "PAID") {
    return null;
  }

  const amount = Number(values.planCostAmount);
  return values.planCostAmount.trim() && !Number.isNaN(amount) ? amount : null;
}

export function normalizeDateTime(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function normalizePlanSchedule(values: GroupIdentityFormValues) {
  if (!values.planScheduleTouched || !values.planTimeZoneId) {
    return null;
  }

  return buildCanonicalPlanScheduleInput({
    durationMinutes: values.planDurationMinutes,
    localDateTime: values.planDateTime,
    scheduleFold: values.planScheduleFold,
    timeZoneId: values.planTimeZoneId,
  });
}

export function normalizeLocation(values: GroupIdentityFormValues) {
  if (values.planLocationMode === "TBD") {
    return null;
  }

  return normalizeOptionalText(values.planLocation);
}

export function normalizeOptionalText(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}
