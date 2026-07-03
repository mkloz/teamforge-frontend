import type { ReactionEmoji } from "@/features/activity/components/conversation-workspace/emoji-picker-panel/reaction-emojis/types";

export function reactionEmoji(
  emoji: string,
  label: string,
  tags: readonly string[],
): ReactionEmoji {
  return { emoji, label, tags };
}
