import type { LucideIcon } from "lucide-react";

import type {
  GroupPlanAccessMode,
  GroupPlanViewerAccess,
} from "@/features/group-plan-detail/lib/group-plan-access";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type { buildExploreNavigation } from "@/shared/navigation";
import type { buildActivityGroupHubNavigation } from "@/shared/navigation/activity-navigation";

type ActionHref =
  | ReturnType<typeof buildActivityGroupHubNavigation>
  | ReturnType<typeof buildExploreNavigation>;

export type GroupPlanViewerMode = GroupPlanAccessMode;

export interface GroupPlanActionDescriptor {
  kind: "link" | "button" | "leave";
  label: string;
  icon: LucideIcon;
  href?: ActionHref;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  title?: string;
  destructive?: boolean;
}

export interface GroupPlanActionViewState {
  mode: GroupPlanViewerMode;
  isMember: boolean;
  primary: GroupPlanActionDescriptor;
  secondary: GroupPlanActionDescriptor | null;
  summary: string;
  joinedGroupId: string | null;
}

export interface GroupPlanActionControls {
  acceptInvite: (inviteId: string) => void;
  cancelRequest: () => void;
  declineInvite: (inviteId: string) => void;
  isAcceptingInvite: boolean;
  isCancellingRequest: boolean;
  isDecliningInvite: boolean;
  isJoining: boolean;
  isLeaving: boolean;
  isOnline: boolean;
  joinGroup: () => void;
  leaveGroup: () => void;
}

export interface ActionStateBuilderContext {
  access: GroupPlanViewerAccess;
  controls: GroupPlanActionControls;
  detail: GroupPlanDetail;
  summary: string;
}

export type ActionStateBuilder = (
  context: ActionStateBuilderContext,
) => GroupPlanActionViewState;

export type JoinActionMode = "direct" | "request";

export type JoinDisabledReason = NonNullable<
  GroupPlanDetail["viewer"]["joinDisabledReason"]
>;
