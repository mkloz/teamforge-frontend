import type {
  UpdateGroupPayload,
  UpdatePlanPayload,
} from "@/features/activity/api/activity.api";
import type {
  CostType,
  Group,
  LocationMode,
  PlanCategory,
} from "@/features/activity/lib/activity-contract";

export interface GroupIdentityFormValues {
  avatar: string;
  coverImage: string | null;
  description: string;
  planCategory: PlanCategory | "";
  planCost: CostType;
  planCostAmount: string;
  planCostDetails: string;
  planDateTime: string;
  planDescription: string;
  planLocation: string;
  planLocationLat: number | null;
  planLocationLng: number | null;
  planLocationMode: LocationMode;
  planTitle: string;
  name: string;
}

export interface GroupIdentityUpdateInput {
  groupId: string;
  groupPayload?: UpdateGroupPayload;
  planId?: string;
  planPayload?: UpdatePlanPayload;
}

type GroupIdentityDetailsInitialValues = Pick<
  GroupIdentityFormValues,
  "avatar" | "description" | "name"
>;

type GroupPlanInitialValues = Omit<
  GroupIdentityFormValues,
  keyof GroupIdentityDetailsInitialValues
>;

type GroupPlanCostInitialValues = Pick<
  GroupPlanInitialValues,
  "planCost" | "planCostAmount" | "planCostDetails"
>;

type GroupPlanLocationInitialValues = Pick<
  GroupPlanInitialValues,
  "planLocation" | "planLocationLat" | "planLocationLng" | "planLocationMode"
>;

type GroupPlan = Group["plan"];

export function getInitialGroupIdentityValues(
  group: Group,
): GroupIdentityFormValues {
  const groupValues = getInitialGroupDetailsValues(group);
  const planValues = getInitialPlanValues(group.plan);

  return {
    avatar: groupValues.avatar,
    coverImage: planValues.coverImage,
    description: groupValues.description,
    name: groupValues.name,
    planCategory: planValues.planCategory,
    planCost: planValues.planCost,
    planCostAmount: planValues.planCostAmount,
    planCostDetails: planValues.planCostDetails,
    planDateTime: planValues.planDateTime,
    planDescription: planValues.planDescription,
    planLocation: planValues.planLocation,
    planLocationLat: planValues.planLocationLat,
    planLocationLng: planValues.planLocationLng,
    planLocationMode: planValues.planLocationMode,
    planTitle: planValues.planTitle,
  };
}

function getInitialGroupDetailsValues(
  group: Group,
): GroupIdentityDetailsInitialValues {
  return {
    avatar: group.avatar ?? "",
    description: group.description ?? "",
    name: group.name,
  };
}

function getInitialPlanValues(plan: GroupPlan): GroupPlanInitialValues {
  return {
    coverImage: plan?.coverImage ?? null,
    planCategory: plan?.category ?? "",
    ...getInitialPlanCostValues(plan),
    planDateTime: toDateTimeLocalValue(plan?.dateTime ?? null),
    planDescription: plan?.description ?? "",
    ...getInitialPlanLocationValues(plan),
    planTitle: plan?.title ?? "",
  };
}

function getInitialPlanCostValues(plan: GroupPlan): GroupPlanCostInitialValues {
  return {
    planCost: plan?.cost ?? "FREE",
    planCostAmount: formatInitialCostAmount(plan?.costAmount),
    planCostDetails: plan?.costDetails ?? "",
  };
}

function formatInitialCostAmount(costAmount: number | null | undefined) {
  return typeof costAmount === "number" ? String(costAmount) : "";
}

function getInitialPlanLocationValues(
  plan: GroupPlan,
): GroupPlanLocationInitialValues {
  return {
    planLocation: plan?.location ?? "",
    planLocationLat: plan?.locationLat ?? null,
    planLocationLng: plan?.locationLng ?? null,
    planLocationMode: plan?.locationMode ?? "TBD",
  };
}

export function isGroupIdentityNameValid(name: string) {
  return name.trim().length > 0;
}

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
  const nextGroupPayload = hasGroupPayloadChanges(group, groupPayload)
    ? groupPayload
    : undefined;
  const nextPlanPayload =
    group.plan && hasPlanPayloadChanges(group, buildPlanPayload(values))
      ? buildPlanPayload(values)
      : undefined;

  return {
    groupId: group.id,
    groupPayload: nextGroupPayload,
    planId: nextPlanPayload ? group.plan?.id : undefined,
    planPayload: nextPlanPayload,
  };
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
  return (
    payload.name !== group.name ||
    payload.description !== group.description ||
    payload.avatar !== group.avatar
  );
}

function buildPlanPayload(values: GroupIdentityFormValues): UpdatePlanPayload {
  return {
    category: values.planCategory || undefined,
    cost: values.planCost,
    costAmount: normalizeCostAmount(values),
    costDetails: normalizeOptionalText(values.planCostDetails),
    coverImage: values.coverImage,
    dateTime: normalizeDateTime(values.planDateTime),
    description: normalizeOptionalText(values.planDescription),
    location: normalizeLocation(values),
    locationLat:
      values.planLocationMode === "IN_PERSON" ? values.planLocationLat : null,
    locationLng:
      values.planLocationMode === "IN_PERSON" ? values.planLocationLng : null,
    locationMode: values.planLocationMode,
    title: values.planTitle.trim(),
  };
}

function hasPlanPayloadChanges(group: Group, payload: UpdatePlanPayload) {
  if (!group.plan) {
    return false;
  }

  return (
    payload.category !== group.plan.category ||
    payload.cost !== group.plan.cost ||
    payload.costAmount !== group.plan.costAmount ||
    payload.costDetails !== group.plan.costDetails ||
    payload.coverImage !== group.plan.coverImage ||
    payload.dateTime !== group.plan.dateTime ||
    payload.description !== group.plan.description ||
    payload.location !== group.plan.location ||
    payload.locationLat !== group.plan.locationLat ||
    payload.locationLng !== group.plan.locationLng ||
    payload.locationMode !== group.plan.locationMode ||
    payload.title !== group.plan.title
  );
}

export function isGroupPlanValid(values: GroupIdentityFormValues) {
  if (!values.planTitle.trim()) {
    return false;
  }

  if (!values.planCategory) {
    return false;
  }

  if (values.planDateTime && !normalizeDateTime(values.planDateTime)) {
    return false;
  }

  if (
    values.planLocationMode !== "TBD" &&
    !normalizeOptionalText(values.planLocation)
  ) {
    return false;
  }

  if (values.planCost === "PAID" && !normalizeCostAmount(values)) {
    return false;
  }

  return true;
}

function normalizeCostAmount(values: GroupIdentityFormValues) {
  if (values.planCost !== "PAID") {
    return null;
  }

  const amount = Number(values.planCostAmount);
  return values.planCostAmount.trim() && !Number.isNaN(amount) ? amount : null;
}

function normalizeDateTime(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeLocation(values: GroupIdentityFormValues) {
  if (values.planLocationMode === "TBD") {
    return null;
  }

  return normalizeOptionalText(values.planLocation);
}

function normalizeOptionalText(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function padDateTimePart(part: number) {
  return String(part).padStart(2, "0");
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${padDateTimePart(date.getMonth() + 1)}-${padDateTimePart(
    date.getDate(),
  )}T${padDateTimePart(date.getHours())}:${padDateTimePart(date.getMinutes())}`;
}
