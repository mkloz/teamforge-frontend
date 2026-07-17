import type { RefetchableQuery } from "@/features/activity/hooks/use-group-ratings/rating-types";
import type { GroupParticipationStatus } from "@/shared/schemas";

export function getGroupRatingsQueryState({
  participationStatus,
  ratingsQuery,
  reviewStateQuery,
}: {
  participationStatus: GroupParticipationStatus | null;
  ratingsQuery: { isError: boolean; isLoading: boolean };
  reviewStateQuery: { isError: boolean; isLoading: boolean };
}) {
  const includesRatings = participationStatus === "PARTICIPATED";

  return {
    isError:
      reviewStateQuery.isError || (includesRatings && ratingsQuery.isError),
    isLoading:
      reviewStateQuery.isLoading || (includesRatings && ratingsQuery.isLoading),
  };
}

export async function refetchGroupRatingData({
  participationStatus,
  ratingsQuery,
  reviewStateQuery,
}: {
  participationStatus: GroupParticipationStatus | null;
  ratingsQuery: RefetchableQuery;
  reviewStateQuery: RefetchableQuery;
}) {
  const refetches = [reviewStateQuery.refetch()];

  if (participationStatus === "PARTICIPATED") {
    refetches.push(ratingsQuery.refetch());
  }

  await Promise.all(refetches);
}
