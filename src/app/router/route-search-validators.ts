import {
  type GroupPlanDetailRouteSearch,
  type GroupPlanDetailSource,
  groupPlanDetailSourceValues,
} from "@/features/group-plan-detail/public/group-plan-detail-navigation";
import {
  type UserDetailIntent,
  type UserDetailRouteSearch,
  userDetailIntentValues,
} from "@/shared/navigation/profile-navigation";

function parseOptionalSearchString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function isStringLiteral<TValue extends string>(
  value: unknown,
  values: readonly TValue[],
): value is TValue {
  return typeof value === "string" && values.some((item) => item === value);
}

function isGroupPlanDetailSource(
  value: unknown,
): value is GroupPlanDetailSource {
  return isStringLiteral(value, groupPlanDetailSourceValues);
}

function isUserDetailIntent(value: unknown): value is UserDetailIntent {
  return isStringLiteral(value, userDetailIntentValues);
}

export function validateGroupPlanDetailSearch(
  search: Record<string, unknown>,
): GroupPlanDetailRouteSearch {
  return {
    plan: parseOptionalSearchString(search.plan),
    proposal: parseOptionalSearchString(search.proposal),
    returnTo: parseOptionalSearchString(search.returnTo),
    source: isGroupPlanDetailSource(search.source) ? search.source : undefined,
  };
}

export function validateUserDetailSearch(
  search: Record<string, unknown>,
): UserDetailRouteSearch {
  return {
    intent: isUserDetailIntent(search.intent) ? search.intent : undefined,
  };
}
