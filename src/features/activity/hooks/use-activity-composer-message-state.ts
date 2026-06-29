import { useActivityStore } from "@/features/activity/store/activity.store";

export function useActivityComposerMessageState() {
  const replyingTo = useActivityStore((state) => state.replyingTo);
  const editingMessage = useActivityStore((state) => state.editingMessage);
  const setReplyingTo = useActivityStore((state) => state.setReplyingTo);
  const setEditingMessage = useActivityStore(
    (state) => state.setEditingMessage,
  );

  return {
    editingMessage,
    replyingTo,
    setEditingMessage,
    setReplyingTo,
  };
}
