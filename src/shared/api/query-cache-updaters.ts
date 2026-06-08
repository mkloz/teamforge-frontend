import { appQueryClient } from "@/shared/api/query-client";
import type { Invite } from "@/shared/schemas";

import { APP_QUERY_KEYS } from "./query-keys";

function getInviteVersion(invite: Invite) {
  return invite.version ?? new Date(invite.updatedAt).getTime();
}

function mergeInviteLists(current: Invite[] | undefined, incoming: Invite) {
  const existing = current?.find((item) => item.id === incoming.id);
  const nextInvite =
    existing && getInviteVersion(existing) > getInviteVersion(incoming)
      ? existing
      : incoming;
  const withoutExisting =
    current?.filter((item) => item.id !== incoming.id) ?? [];

  return [nextInvite, ...withoutExisting].sort(
    (left, right) => getInviteVersion(right) - getInviteVersion(left),
  );
}

export function applyHomeInvitationUpdate(invite: Invite) {
  appQueryClient.setQueryData<Invite[] | undefined>(
    APP_QUERY_KEYS.home.invitations,
    (current) => {
      const merged = mergeInviteLists(current, invite);
      return merged.filter((item) => item.status === "PENDING");
    },
  );

  appQueryClient.setQueryData<Invite[] | undefined>(
    APP_QUERY_KEYS.home.sentInvitations,
    (current) => mergeInviteLists(current, invite),
  );
}
