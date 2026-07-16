import dayjs from "dayjs";
import type {
  Group,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import { buildAppUrl } from "@/shared/lib/app-url";
import { formatPanelToken } from "../lib/constants";
import { stripPanelStatusPrefix } from "../status-prefix";
import type {
  GroupIdentitySectionProps,
  GroupIdentityViewState,
} from "./types";

export function getGroupIdentityViewState({
  activity,
  avatar,
  coverImage,
  canEditGroup,
  createdAt,
  currentUserRole,
  description,
  groupId,
  isReadOnly = false,
  name,
  status,
}: Pick<
  GroupIdentitySectionProps,
  | "activity"
  | "avatar"
  | "coverImage"
  | "canEditGroup"
  | "createdAt"
  | "currentUserRole"
  | "description"
  | "groupId"
  | "isReadOnly"
  | "name"
  | "status"
>): GroupIdentityViewState {
  const statusLabel = formatPanelToken(status);
  const displayName = stripPanelStatusPrefix(name, statusLabel);
  const displayDescription = getDisplayDescription(
    description,
    displayName,
    isReadOnly,
  );
  const groupLink = buildAppUrl(`/groups/${encodeURIComponent(groupId)}`);

  return {
    activityTitle: getDisplayActivityTitle(activity, statusLabel),
    avatarSrc: getDisplayAvatarSrc(avatar, coverImage),
    canEditGroup:
      canEditGroup ?? canEditGroupDetails(currentUserRole, isReadOnly),
    createdLabel: getCreatedLabel(createdAt),
    displayDescription,
    displayName,
    groupLink,
  };
}

function canEditGroupDetails(currentUserRole: MemberRole, isReadOnly: boolean) {
  return currentUserRole === "ADMIN" && !isReadOnly;
}

function getCreatedLabel(createdAt: string) {
  const createdDate = dayjs(createdAt);

  return createdDate.isValid()
    ? `Created ${createdDate.format("MMM D, YYYY")}`
    : "Created recently";
}

function getDisplayActivityTitle(
  activity: Group["activity"] | undefined,
  statusLabel: string,
) {
  return activity?.title
    ? stripPanelStatusPrefix(activity.title, statusLabel)
    : null;
}

function getDisplayAvatarSrc(
  avatar: string | null | undefined,
  coverImage: string | null | undefined,
) {
  return avatar && avatar !== coverImage ? avatar : null;
}

function getDisplayDescription(
  description: string | null,
  groupName: string,
  isReadOnly: boolean,
) {
  if (!description) {
    return null;
  }

  const looksInternal =
    /historical group volume|extra ratings|mini retro|seed data|fixture/i.test(
      description,
    );

  if (!isReadOnly || !looksInternal) {
    return description;
  }

  return `${groupName} is saved in this group's history.`;
}
