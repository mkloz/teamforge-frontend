import type {
  UpdateGroupPayload,
  UpdatePlanPayload,
} from "@/features/activity/api/activity.api";
import {
  normalizeCostAmount,
  normalizeDateTime,
  normalizeLocation,
  normalizeOptionalText,
  normalizePlanSchedule,
} from "@/features/activity/hooks/group-identity/group-identity-form-state/normalizers";
import type {
  GroupIdentityFormValues,
  GroupIdentityUpdateInput,
  GroupPayloadComparableField,
  PlanPayloadComparableField,
} from "@/features/activity/hooks/group-identity/group-identity-form-state/types";
import type { Group } from "@/features/activity/lib/activity-contract";

const GROUP_PAYLOAD_CHANGE_FIELDS = [
  "avatar",
  "description",
  "name",
] satisfies readonly GroupPayloadComparableField[];

const PLAN_PAYLOAD_CHANGE_FIELDS = [
  "category",
  "cost",
  "costAmount",
  "costDetails",
  "coverImage",
  "dateTime",
  "durationMinutes",
  "description",
  "location",
  "locationLat",
  "locationLng",
  "locationMode",
  "title",
  "timeZoneId",
] satisfies readonly PlanPayloadComparableField[];

export function hasGroupIdentityChanges(
  group: Group,
  values: GroupIdentityFormValues,
) {
  return (
    hasGroupIdentityDetailsChanges(group, values) ||
    hasGroupPlanDetailsChanges(group, values)
  );
}

export function hasGroupIdentityDetailsChanges(
  group: Group,
  values: GroupIdentityFormValues,
) {
  return hasGroupPayloadChanges(group, buildGroupPayload(values));
}

export function hasGroupPlanDetailsChanges(
  group: Group,
  values: GroupIdentityFormValues,
) {
  return group.plan
    ? hasPlanPayloadChanges(group, buildPlanPayload(values))
    : false;
}

export function buildGroupIdentityUpdateInput(
  group: Group,
  values: GroupIdentityFormValues,
): GroupIdentityUpdateInput {
  const groupPayload = buildGroupPayload(values);
  const planPayload = buildPlanPayload(values);
  const nextGroupPayload = getChangedGroupPayload(group, groupPayload);
  const nextPlanPayload = getChangedPlanPayload(group, planPayload);

  return {
    groupId: group.id,
    groupPayload: nextGroupPayload,
    planId: nextPlanPayload ? group.plan?.id : undefined,
    planPayload: nextPlanPayload,
  };
}

function getChangedGroupPayload(
  group: Group,
  groupPayload: UpdateGroupPayload,
) {
  return hasGroupPayloadChanges(group, groupPayload) ? groupPayload : undefined;
}

function getChangedPlanPayload(group: Group, planPayload: UpdatePlanPayload) {
  return group.plan && hasPlanPayloadChanges(group, planPayload)
    ? planPayload
    : undefined;
}

function buildGroupPayload(
  values: GroupIdentityFormValues,
): UpdateGroupPayload {
  return {
    avatar: normalizeOptionalText(values.avatar),
    description: normalizeOptionalText(values.description),
    name: values.name.trim(),
  };
}

function hasGroupPayloadChanges(group: Group, payload: UpdateGroupPayload) {
  return GROUP_PAYLOAD_CHANGE_FIELDS.some(
    (field) => payload[field] !== group[field],
  );
}

function buildPlanPayload(values: GroupIdentityFormValues): UpdatePlanPayload {
  const canonicalSchedule = normalizePlanSchedule(values);
  return {
    category: values.planCategory || undefined,
    cost: values.planCost,
    costAmount: normalizeCostAmount(values),
    costDetails: normalizeOptionalText(values.planCostDetails),
    coverImage: values.coverImage,
    dateTime:
      canonicalSchedule?.dateTime ?? normalizeDateTime(values.planDateTime),
    durationMinutes: canonicalSchedule?.durationMinutes,
    description: normalizeOptionalText(values.planDescription),
    location: normalizeLocation(values),
    locationLat:
      values.planLocationMode === "IN_PERSON" ? values.planLocationLat : null,
    locationLng:
      values.planLocationMode === "IN_PERSON" ? values.planLocationLng : null,
    locationMode: values.planLocationMode,
    localStartDate: canonicalSchedule?.localStartDate,
    localStartTime: canonicalSchedule?.localStartTime,
    scheduleFold: canonicalSchedule?.scheduleFold,
    timeZoneId: canonicalSchedule?.timeZoneId,
    title: values.planTitle.trim(),
  };
}

function hasPlanPayloadChanges(group: Group, payload: UpdatePlanPayload) {
  const plan = group.plan;

  if (!plan) {
    return false;
  }

  return PLAN_PAYLOAD_CHANGE_FIELDS.some((field) => {
    const nextValue = payload[field];
    const currentValue = plan[field];
    return nextValue === undefined ? false : nextValue !== currentValue;
  });
}
