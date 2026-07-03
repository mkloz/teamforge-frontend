import { useQuery } from "@tanstack/react-query";
import { activityQueries } from "@/features/activity/api/activity-queries";
import type { ActivitySelectionKind } from "@/features/activity/store/activity-store/activity-store.types";

type UseSelectedConversationQueriesOptions = {
  selectedId: string | null;
  selectedKind: ActivitySelectionKind | null;
};

export function useSelectedConversationQueries({
  selectedId,
  selectedKind,
}: UseSelectedConversationQueriesOptions) {
  const chatsQuery = useQuery(activityQueries.chats());

  const groupQuery = useQuery({
    ...activityQueries.groupSelection(selectedId ?? ""),
    enabled: isSelectedConversationQueryEnabled(
      selectedKind,
      selectedId,
      "group",
    ),
  });

  const directQuery = useQuery({
    ...activityQueries.directSelection(selectedId ?? ""),
    enabled: isSelectedConversationQueryEnabled(selectedKind, selectedId, "dm"),
  });

  return {
    chatsQuery,
    directQuery,
    groupQuery,
  };
}

function isSelectedConversationQueryEnabled(
  selectedKind: ActivitySelectionKind | null,
  selectedId: string | null,
  queryKind: Extract<ActivitySelectionKind, "dm" | "group">,
) {
  return selectedKind === queryKind && Boolean(selectedId);
}
