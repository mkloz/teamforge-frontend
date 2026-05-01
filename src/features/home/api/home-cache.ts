import { applyHomeInvitationUpdate } from "@/shared/api/query-cache-updaters";
import { appQueryClient } from "@/shared/api/query-client";
import type { ExploreGroup, Invite } from "@/shared/schemas";

import { HOME_RECOMMENDATIONS_QUERY_KEY } from "@/features/home/api/home-query-keys";

export const HomeCache = {
  applyInvitationUpdate(invite: Invite) {
    applyHomeInvitationUpdate(invite);
  },

  removeRecommendedGroup(groupId: string) {
    appQueryClient.setQueryData<ExploreGroup[] | undefined>(
      HOME_RECOMMENDATIONS_QUERY_KEY,
      (groups) => groups?.filter((group) => group.id !== groupId),
    );
  },
};
