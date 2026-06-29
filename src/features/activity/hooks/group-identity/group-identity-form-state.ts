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
import { toDateTimeLocalValue } from "@/shared/lib/date-time-local";

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
type ExistingGroupPlan = NonNullable<GroupPlan>;
type GroupPayloadComparableField = keyof UpdateGroupPayload & keyof Group;
type PlanPayloadComparableField = keyof UpdatePlanPayload &
  keyof ExistingGroupPlan;

const DEFAULT_PLAN_VALUES = {
  coverImage: null,
  planCategory: "",
  planCost: "FREE",
  planCostAmount: "",
  planCostDetails: "",
  planDateTime: "",
  planDescription: "",
  planLocation: "",
  planLocationLat: null,
  planLocationLng: null,
  planLocationMode: "TBD",
  planTitle: "",
} satisfies GroupPlanInitialValues;

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
  "description",
  "location",
  "locationLat",
  "locationLng",
  "locationMode",
  "title",
] satisfies readonly PlanPayloadComparableField[];

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
  if (!plan) {
    return DEFAULT_PLAN_VALUES;
  }

  return {
    coverImage: getInitialPlanCoverImage(plan),
    planCategory: getInitialPlanCategory(plan),
    ...getInitialPlanCostValues(plan),
    planDateTime: getInitialPlanDateTime(plan),
    planDescription: getInitialPlanDescription(plan),
    ...getInitialPlanLocationValues(plan),
    planTitle: getInitialPlanTitle(plan),
  };
}

function getInitialPlanCoverImage(plan: ExistingGroupPlan) {
  return plan.coverImage ?? DEFAULT_PLAN_VALUES.coverImage;
}

function getInitialPlanCategory(plan: ExistingGroupPlan) {
  return plan.category ?? DEFAULT_PLAN_VALUES.planCategory;
}

function getInitialPlanCostValues(
  plan: ExistingGroupPlan,
): GroupPlanCostInitialValues {
  return {
    planCost: plan.cost ?? DEFAULT_PLAN_VALUES.planCost,
    planCostAmount: formatInitialCostAmount(plan.costAmount),
    planCostDetails: plan.costDetails ?? DEFAULT_PLAN_VALUES.planCostDetails,
  };
}

function formatInitialCostAmount(costAmount: number | null | undefined) {
  return typeof costAmount === "number" ? String(costAmount) : "";
}

function getInitialPlanDateTime(plan: ExistingGroupPlan) {
  return toDateTimeLocalValue(plan.dateTime ?? null);
}

function getInitialPlanDescription(plan: ExistingGroupPlan) {
  return plan.description ?? DEFAULT_PLAN_VALUES.planDescription;
}

function getInitialPlanLocationValues({
  location,
  locationLat,
  locationLng,
  locationMode,
}: ExistingGroupPlan): GroupPlanLocationInitialValues {
  return {
    planLocation: getInitialPlanLocation(location),
    planLocationLat: getInitialPlanLocationCoordinate(locationLat),
    planLocationLng: getInitialPlanLocationCoordinate(locationLng),
    planLocationMode: getInitialPlanLocationMode(locationMode),
  };
}

function getInitialPlanLocation(location: string | null | undefined) {
  return location ?? DEFAULT_PLAN_VALUES.planLocation;
}

function getInitialPlanLocationCoordinate(
  coordinate: number | null | undefined,
) {
  return coordinate ?? null;
}

function getInitialPlanLocationMode(
  locationMode: ExistingGroupPlan["locationMode"],
) {
  return locationMode ?? DEFAULT_PLAN_VALUES.planLocationMode;
}

function getInitialPlanTitle(plan: ExistingGroupPlan) {
  return plan.title ?? DEFAULT_PLAN_VALUES.planTitle;
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
  const plan = group.plan;

  if (!plan) {
    return false;
  }

  return PLAN_PAYLOAD_CHANGE_FIELDS.some(
    (field) => payload[field] !== plan[field],
  );
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
