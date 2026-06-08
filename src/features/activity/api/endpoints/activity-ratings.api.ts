import {
  type CreateRatingPayload,
  createRatingPayloadSchema,
  DEFAULT_ACTIVITY_API_LIMIT,
  type DeferGroupReviewPayload,
  deferGroupReviewPayloadSchema,
  paginatedRatingsSchema,
} from "@/features/activity/api/activity-api-contracts";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  createRatingResultSchema,
  groupReviewStateSchema,
} from "@/shared/schemas";

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

export async function getGroupReviewState(groupId: string) {
  const response = await apiClient
    .get(`ratings/groups/${groupId}/review-state`)
    .json<unknown>();

  return groupReviewStateSchema.parse(response);
}

export async function createRating(payload: CreateRatingPayload) {
  const response = await apiClient.post("ratings", {
    json: createRatingPayloadSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) =>
    createRatingResultSchema.parse(value),
  );
}

export async function deferGroupReview(
  groupId: string,
  payload: DeferGroupReviewPayload,
) {
  const response = await apiClient.post(
    `ratings/groups/${groupId}/review-deferrals`,
    {
      json: deferGroupReviewPayloadSchema.parse(payload),
    },
  );

  return parseJsonWithRequestId(response, (value) =>
    groupReviewStateSchema.parse(value),
  );
}
