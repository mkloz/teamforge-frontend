import * as ChatEndpoints from "@/features/activity/api/endpoints/activity-chats.api";
import * as FriendshipEndpoints from "@/features/activity/api/endpoints/activity-friendships.api";
import * as GroupEndpoints from "@/features/activity/api/endpoints/activity-groups.api";
import * as InviteEndpoints from "@/features/activity/api/endpoints/activity-invites.api";
import * as PlanEndpoints from "@/features/activity/api/endpoints/activity-plans.api";
import * as RatingEndpoints from "@/features/activity/api/endpoints/activity-ratings.api";

export type {
  CreateInvitePayload,
  CreatePlanProposalDto,
  CreateRatingMutationResult,
  CreateRatingPayload,
  FriendshipMutationResult,
  GetChatMessagesParams,
  GroupMutationResult,
  InviteMutationResult,
  MessageMutationResult,
  PaginatedMessagesResponse,
  PlanMutationResult,
  SendMessagePayload,
  UpdateGroupPayload,
  UpdateMessagePayload,
  UpdatePlanPayload,
  VotePlanProposalDto,
} from "@/features/activity/api/activity-api-contracts";

export const ActivityApi = {
  ...GroupEndpoints,
  ...ChatEndpoints,
  ...FriendshipEndpoints,
  ...PlanEndpoints,
  ...RatingEndpoints,
  ...InviteEndpoints,
};
