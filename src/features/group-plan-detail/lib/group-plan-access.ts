import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type { ExploreJoinResult } from "@/shared/schemas/explore";

export type GroupPlanViewerRelationship =
  GroupPlanDetail["viewer"]["relationship"];

export type GroupPlanAccessMode =
  | "member"
  | "invited"
  | "requested"
  | "joinable"
  | "blocked";

export interface GroupPlanViewerAccess {
  isInvited: boolean;
  isMember: boolean;
  isRequested: boolean;
  joinedGroupId: string | null;
  mode: GroupPlanAccessMode;
}

const MEMBER_RELATIONSHIPS = ["ADMIN", "MODERATOR", "MEMBER"] as const;
const MEMBER_RELATIONSHIP_SET = new Set<GroupPlanViewerRelationship>(
  MEMBER_RELATIONSHIPS,
);

interface ViewerModeInput {
  canJoin: boolean;
  canRequestToJoin: boolean;
  isInvited: boolean;
  isMember: boolean;
  isRequested: boolean;
}

interface ViewerModeRule {
  applies: (input: ViewerModeInput) => boolean;
  mode: GroupPlanAccessMode;
}

const VIEWER_MODE_RULES = [
  { applies: ({ isMember }) => isMember, mode: "member" },
  { applies: ({ isInvited }) => isInvited, mode: "invited" },
  { applies: ({ isRequested }) => isRequested, mode: "requested" },
  { applies: canViewerJoinPlan, mode: "joinable" },
] satisfies readonly ViewerModeRule[];

export function isGroupPlanMemberRelationship(
  relationship: GroupPlanViewerRelationship,
) {
  return MEMBER_RELATIONSHIP_SET.has(relationship);
}

export function isGroupPlanInvitedRelationship(
  relationship: GroupPlanViewerRelationship,
) {
  return relationship === "INVITED";
}

export function isGroupPlanRequestedRelationship(
  relationship: GroupPlanViewerRelationship,
) {
  return relationship === "REQUESTED";
}

export function getGroupPlanViewerAccess(
  detail: GroupPlanDetail,
  joinResult: ExploreJoinResult | null | undefined,
): GroupPlanViewerAccess {
  const relationship = detail.viewer.relationship;
  const isInvited = isGroupPlanInvitedRelationship(relationship);
  const isMember = isGroupPlanMemberRelationship(relationship);
  const isRequested = isGroupPlanRequestedAccess(relationship, joinResult);

  return {
    isInvited,
    isMember,
    isRequested,
    joinedGroupId: getJoinedGroupId(joinResult),
    mode: getGroupPlanViewerMode({
      canJoin: detail.viewer.canJoin,
      canRequestToJoin: detail.viewer.canRequestToJoin,
      isInvited,
      isMember,
      isRequested,
    }),
  };
}

function getGroupPlanViewerMode(input: ViewerModeInput): GroupPlanAccessMode {
  return (
    VIEWER_MODE_RULES.find((rule) => rule.applies(input))?.mode ?? "blocked"
  );
}

function canViewerJoinPlan({
  canJoin,
  canRequestToJoin,
}: Pick<ViewerModeInput, "canJoin" | "canRequestToJoin">) {
  return canJoin || canRequestToJoin;
}

function getJoinedGroupId(joinResult: ExploreJoinResult | null | undefined) {
  return joinResult?.status === "JOINED" ? joinResult.groupId : null;
}

function isGroupPlanRequestedAccess(
  relationship: GroupPlanViewerRelationship,
  joinResult: ExploreJoinResult | null | undefined,
) {
  return (
    isGroupPlanRequestedRelationship(relationship) ||
    joinResult?.status === "REQUESTED"
  );
}
