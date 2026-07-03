import type {
  ActivityDirectSelectionData,
  ActivityGroupSelectionData,
} from "@/features/activity/api/activity-query-data";
import type { ActivitySelectionKind } from "@/features/activity/store/activity-store/activity-store.types";

export function getSelectedConversationData({
  directSelection,
  groupSelection,
  selectedKind,
}: {
  directSelection: ActivityDirectSelectionData | undefined;
  groupSelection: ActivityGroupSelectionData | undefined;
  selectedKind: ActivitySelectionKind | null;
}) {
  return {
    proposalMessages: getSelectedProposalMessages(groupSelection),
    selectedChat: getSelectedDirectChat(directSelection, selectedKind),
    selectedGroup: getSelectedGroup(groupSelection, selectedKind),
  };
}

function getSelectedProposalMessages(
  groupSelection: ActivityGroupSelectionData | undefined,
) {
  return groupSelection?.proposalMessages ?? [];
}

function getSelectedDirectChat(
  directSelection: ActivityDirectSelectionData | undefined,
  selectedKind: ActivitySelectionKind | null,
) {
  return selectedKind === "dm" ? (directSelection?.chat ?? null) : null;
}

function getSelectedGroup(
  groupSelection: ActivityGroupSelectionData | undefined,
  selectedKind: ActivitySelectionKind | null,
) {
  return selectedKind === "group" ? (groupSelection?.group ?? null) : null;
}
