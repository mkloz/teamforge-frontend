import type { ActivityCommands } from "@/features/activity/api/activity-commands";

export interface RatingSummary {
  planId: string | null;
  rateeId: string;
  raterId: string;
}

export type RatingMutationResult = Awaited<
  ReturnType<typeof ActivityCommands.createGroupRating>
>;

export interface RefetchableQuery {
  refetch: () => Promise<unknown>;
}
