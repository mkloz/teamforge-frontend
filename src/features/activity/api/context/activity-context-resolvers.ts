import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";

import type { ActivityQueryOptionsContext } from "@/features/activity/api/activity-query-options";
import { ActivityQueryOptions } from "@/features/activity/api/activity-query-options";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";

import {
  buildGroupParticipants,
  mapCurrentUserParticipant,
} from "./activity-context-projections";

export async function ensureBaseData() {
  const [currentUser, groups, chats, friendships] = await Promise.all([
    appQueryClient.ensureQueryData(currentUserQueryOptions()),
    appQueryClient.ensureQueryData(ActivityQueryOptions.groups()),
    appQueryClient.ensureQueryData(ActivityQueryOptions.chats()),
    appQueryClient.ensureQueryData(ActivityQueryOptions.friendships()),
  ]);

  return {
    currentUser,
    currentUserParticipant: mapCurrentUserParticipant(currentUser),
    groups,
    chats,
    friendships,
  };
}

export async function resolveParticipants(
  context: ActivityQueryOptionsContext,
  kind: "group" | "dm",
  selectedId: string,
  currentUserParticipant: ActivityParticipant,
) {
  if (kind === "group") {
    const selection = await appQueryClient.ensureQueryData(
      ActivityQueryOptions.groupSelection(context, selectedId),
    );

    return selection.group
      ? buildGroupParticipants(selection.group, currentUserParticipant)
      : [currentUserParticipant];
  }

  const selection = await appQueryClient.ensureQueryData(
    ActivityQueryOptions.directSelection(context, selectedId),
  );

  return (
    selection.chat?.participants
      ?.map((participant) => participant.user)
      .filter(
        (participant): participant is ActivityParticipant =>
          participant !== undefined,
      ) ?? [currentUserParticipant]
  );
}

export async function resolveChatId(kind: "group" | "dm", selectedId: string) {
  if (kind === "dm") {
    return selectedId;
  }

  const chats = await appQueryClient.ensureQueryData(
    ActivityQueryOptions.chats(),
  );

  return chats.find((chat) => chat.groupId === selectedId)?.id ?? null;
}
