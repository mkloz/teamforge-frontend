import type {
  UpdateGroupPayload,
  UpdatePlanPayload,
} from "@/features/activity/api/activity.api";
import type { Group } from "@/features/activity/lib/activity-contract";

export interface GroupIdentityFormValues {
  avatar: string;
  coverImage: string | null;
  description: string;
  name: string;
}

export interface GroupIdentityUpdateInput {
  groupId: string;
  groupPayload?: UpdateGroupPayload;
  planId?: string;
  planPayload?: UpdatePlanPayload;
}

export function getInitialGroupIdentityValues(
  group: Group,
): GroupIdentityFormValues {
  return {
    avatar: group.avatar ?? "",
    coverImage: group.plan?.coverImage ?? null,
    description: group.description ?? "",
    name: group.name,
  };
}

export function isGroupIdentityNameValid(name: string) {
  return name.trim().length > 0;
}

export function hasGroupIdentityChanges(
  group: Group,
  values: GroupIdentityFormValues,
) {
  const groupPayload = buildGroupPayload(values);

  return (
    groupPayload.name !== group.name ||
    groupPayload.description !== group.description ||
    groupPayload.avatar !== group.avatar ||
    values.coverImage !== (group.plan?.coverImage ?? null)
  );
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
    group.plan && values.coverImage !== group.plan.coverImage
      ? { coverImage: values.coverImage }
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

function normalizeOptionalText(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}
