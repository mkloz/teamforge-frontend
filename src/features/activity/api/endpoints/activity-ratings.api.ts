import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import { createRatingResultSchema } from "@/shared/schemas";

import {
  DEFAULT_ACTIVITY_API_LIMIT,
  createRatingPayloadSchema,
  paginatedRatingsSchema,
  type CreateRatingPayload,
} from "@/features/activity/api/activity-api-contracts";

export async function getGroupRatings(groupId: string) {
  const response = await apiClient
    .get(`ratings/groups/${groupId}`, {
      searchParams: {
        limit: DEFAULT_ACTIVITY_API_LIMIT,
      },
    })
    .json<unknown>();

  return paginatedRatingsSchema.parse(response).items;
}

export async function createRating(payload: CreateRatingPayload) {
  const response = await apiClient.post("ratings", {
    json: createRatingPayloadSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) =>
    createRatingResultSchema.parse(value),
  );
}
