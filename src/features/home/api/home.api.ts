import { apiClient } from "@/shared/api/api";
import {
  createPaginatedSchema,
  exploreGroupSchema,
  groupApiSchema,
  inviteSchema,
} from "@/shared/schemas";

export class HomeApi {
  static async getGroups() {
    const response = await apiClient
      .get("groups", {
        searchParams: {
          limit: 24,
        },
      })
      .json<unknown>();

    return createPaginatedSchema(groupApiSchema).parse(response).items;
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

  static async getRecommendations() {
    const response = await apiClient
      .get("explore/groups", {
        searchParams: {
          limit: 6,
        },
      })
      .json<unknown>();

    return createPaginatedSchema(exploreGroupSchema).parse(response).items;
  }

  static async acceptInvitation(inviteId: string) {
    const response = await apiClient
      .post(`invites/${inviteId}/accept`)
      .json<unknown>();

    return inviteSchema.parse(response);
  }

  static async declineInvitation(inviteId: string) {
    const response = await apiClient
      .post(`invites/${inviteId}/decline`)
      .json<unknown>();

    return inviteSchema.parse(response);
  }
}
