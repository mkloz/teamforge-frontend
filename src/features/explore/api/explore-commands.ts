import { ExploreApi } from "@/features/explore/api/explore.api";
import { ExploreCache } from "@/features/explore/api/explore-cache";
import { invalidateGroupMembershipSurfaces } from "@/shared/api/query-invalidation";

export const ExploreCommands = {
  async joinGroup(groupId: string) {
    const result = await ExploreApi.joinGroup(groupId);

    ExploreCache.removeJoinedGroup(result.data);

    await invalidateGroupMembershipSurfaces();

    return result;
  },
};
