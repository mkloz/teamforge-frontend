import type { RefetchableQuery } from "@/features/activity/hooks/use-group-ratings/rating-types";

export function getGroupRatingsQueryState({
  ratingsQuery,
  reviewStateQuery,
}: {
  ratingsQuery: { isError: boolean; isLoading: boolean };
  reviewStateQuery: { isError: boolean; isLoading: boolean };
}) {
  return {
    isError: ratingsQuery.isError || reviewStateQuery.isError,
    isLoading: ratingsQuery.isLoading || reviewStateQuery.isLoading,
  };
}

export async function refetchGroupRatingData({
  ratingsQuery,
  reviewStateQuery,
}: {
  ratingsQuery: RefetchableQuery;
  reviewStateQuery: RefetchableQuery;
}) {
  await Promise.all([ratingsQuery.refetch(), reviewStateQuery.refetch()]);
}
