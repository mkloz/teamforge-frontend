import { useQuery } from "@tanstack/react-query";
import { ActivityQueries } from "../api/activity.queries";
import { useActivityStore } from "../store/activity.store";

export function useActivitySelection() {
  const selectedId = useActivityStore((state) => state.selectedId);
  const selectedKind = useActivityStore((state) => state.selectedKind);
  const groups = useActivityStore((state) => state.groups);
  const direct = useActivityStore((state) => state.direct);

  const groupQuery = useQuery({
    ...ActivityQueries.groupSelection(selectedId ?? ""),
    enabled: selectedKind === "group" && !!selectedId,
  });

  const directQuery = useQuery({
    ...ActivityQueries.directSelection(selectedId ?? ""),
    enabled: selectedKind === "dm" && !!selectedId,
  });

  return {
    selectedId,
    selectedKind,
    groups,
    direct,
    selectedGroup:
      selectedKind === "group" ? (groupQuery.data?.group ?? null) : null,
    selectedGroupMessages:
      selectedKind === "group" ? (groupQuery.data?.messages ?? []) : [],
    typingUsers:
      selectedKind === "group" ? (groupQuery.data?.typingUsers ?? []) : [],
    selectedChat:
      selectedKind === "dm" ? (directQuery.data?.chat ?? null) : null,
    selectedDirectMessages:
      selectedKind === "dm" ? (directQuery.data?.messages ?? []) : [],
    isTyping:
      selectedKind === "dm" ? (directQuery.data?.isTyping ?? false) : false,
  };
}
