import {
  normalizeCostAmount,
  normalizeDateTime,
  normalizeOptionalText,
} from "@/features/activity/hooks/group-identity/group-identity-form-state/normalizers";
import type { GroupIdentityFormValues } from "@/features/activity/hooks/group-identity/group-identity-form-state/types";

export function isGroupIdentityNameValid(name: string) {
  return name.trim().length > 0;
}

export function isGroupPlanValid(values: GroupIdentityFormValues) {
  return [
    hasRequiredPlanTitle(values),
    hasRequiredPlanCategory(values),
    hasValidPlanDateTime(values),
    hasRequiredPlanLocation(values),
    hasRequiredPlanCostAmount(values),
  ].every(Boolean);
}

function hasRequiredPlanTitle(values: GroupIdentityFormValues) {
  return values.planTitle.trim().length > 0;
}

function hasRequiredPlanCategory(values: GroupIdentityFormValues) {
  return Boolean(values.planCategory);
}

function hasValidPlanDateTime(values: GroupIdentityFormValues) {
  return (
    !values.planDateTime || Boolean(normalizeDateTime(values.planDateTime))
  );
}

function hasRequiredPlanLocation(values: GroupIdentityFormValues) {
  return (
    values.planLocationMode === "TBD" ||
    Boolean(normalizeOptionalText(values.planLocation))
  );
}

function hasRequiredPlanCostAmount(values: GroupIdentityFormValues) {
  return values.planCost !== "PAID" || Boolean(normalizeCostAmount(values));
}
