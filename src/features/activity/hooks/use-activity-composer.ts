import { useCallback } from "react";
import { ActivityQueries } from "../api/activity.queries";
import { useActivityStore } from "../store/activity.store";

export function useActivityComposer() {
  const selectedKind = useActivityStore((state) => state.selectedKind);
  const selectedId = useActivityStore((state) => state.selectedId);
  const replyingTo = useActivityStore((state) => state.replyingTo);

  const handleSendMessage = useCallback(
    (content: string) => {
      void ActivityQueries.sendMessage(
        selectedKind,
        selectedId,
        content,
        replyingTo?.id ?? null,
      );
    },
    [replyingTo?.id, selectedId, selectedKind],
  );

  return {
    handleSendMessage,
  };
}
