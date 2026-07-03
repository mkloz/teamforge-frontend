import type { RefObject } from "react";

import type { MessageScrollHandle } from "@/features/activity/components/conversation-workspace/message-timeline/message-scroll.types";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";
import type { useActivityComposer } from "@/features/activity/hooks/use-activity-composer";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";

export interface ActivitySelectedConversationStageProps {
  activity: ActivityWorkspace;
  isMobile: boolean;
  isOnline: boolean;
}

export interface SelectedGroupMemberProfile {
  groupId: string;
  memberId: string;
}

export type ActivityComposer = ReturnType<typeof useActivityComposer>;
export type SelectedGroup = NonNullable<ActivityWorkspace["selectedGroup"]>;
export type SelectedChat = NonNullable<ActivityWorkspace["selectedChat"]>;
export type ConversationStageViewport = "desktop" | "mobile";

export interface InitialMessageTimelineState {
  isError: boolean;
  isLoading: boolean;
}

export interface ConversationStageRuntime {
  isOnline: boolean;
  messageTimeline: InitialMessageTimelineState;
}

export type SelectedConversationStage =
  | { kind: "dm"; selectedChat: SelectedChat }
  | { kind: "empty" }
  | { kind: "group"; selectedGroup: SelectedGroup }
  | { kind: "saved" };

export interface GroupDetailPanelSelection {
  closeGroupDetailPanel: () => void;
  openCurrentPlanInGroupPanel: () => void;
  openGroupMemberProfile: (participant: ActivityParticipant) => void;
  selectedGroupMemberId: string | null;
  setSelectedGroupMemberId: (memberId: string | null) => void;
  toggleGroupDetailPanel: () => void;
}

export interface SelectedConversationStageContentProps {
  activity: ActivityWorkspace;
  composer: ActivityComposer;
  groupDetailPanelSelection: GroupDetailPanelSelection;
  groupMessageScrollHandleRef: RefObject<MessageScrollHandle | null>;
  runtime: ConversationStageRuntime;
  selectedStage: SelectedConversationStage;
  viewport: ConversationStageViewport;
}
