import { homeGroupSchema } from "@/features/home/schemas/home-group.schema";
import { apiClient } from "@/shared/api/api";
import { EXPLORE_DEFAULT_DISTANCE_KM } from "@/shared/api/api-constraints";
import { getExploreGroupsResponse } from "@/shared/api/explore-groups-api";
import { postExploreGroupJoin } from "@/shared/api/group-membership-api";
import { postGroupParticipationResponse } from "@/shared/api/group-participation-api";
import {
  acceptInvite,
  declineInvite,
} from "@/shared/api/invite-membership-api";
import {
  createPaginatedSchema,
  exploreGroupSchema,
  inviteSchema,
  type RecordGroupParticipationPayload,
} from "@/shared/schemas";

export class HomeApi {
  static async getGroups() {
    const response = await apiClient
      .get("groups/home-summary", {
        searchParams: {
          limit: 100,
        },
      })
      .json<unknown>();

    return createPaginatedSchema(homeGroupSchema).parse(response).items;
  }

  static async getInvitations() {
    const response = await apiClient
      .get("invites/received", {
        searchParams: {
          status: "PENDING",
          limit: 6,
        },
      })
      .json<unknown>();

    return createPaginatedSchema(inviteSchema).parse(response).items;
  }

  static async getSentInvitations() {
    const response = await apiClient
      .get("invites/sent", {
        searchParams: {
          limit: 12,
        },
      })
      .json<unknown>();

    return createPaginatedSchema(inviteSchema).parse(response).items;
  }

  static async getRecommendations() {
    const response = await getExploreGroupsResponse({
      limit: 6,
      maxDistanceKm: EXPLORE_DEFAULT_DISTANCE_KM,
      sortBy: "MATCH",
    });

    return createPaginatedSchema(exploreGroupSchema).parse(response).items;
  }

  static async acceptInvitation(inviteId: string) {
    const result = await acceptInvite(inviteId);
    return result.data;
  }

  static async declineInvitation(inviteId: string) {
    const result = await declineInvite(inviteId);
    return result.data;
  }

  static async joinRecommendedGroup(groupId: string) {
    return postExploreGroupJoin(groupId);
  }

  static async recordGroupParticipation(
    groupId: string,
    payload: RecordGroupParticipationPayload,
  ) {
    return postGroupParticipationResponse(groupId, payload);
  }
}
