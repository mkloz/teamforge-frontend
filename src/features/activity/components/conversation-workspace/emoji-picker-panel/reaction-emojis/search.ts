import type { ReactionEmoji } from "@/features/activity/components/conversation-workspace/emoji-picker-panel/reaction-emojis/types";

export function getReactionEmojiSearchPattern(normalizedSearch: string) {
  return new RegExp(escapeRegExp(normalizedSearch), "u");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getReactionEmojiSearchText(emoji: ReactionEmoji) {
  return `${emoji.emoji} ${emoji.label} ${emoji.tags.join(" ")}`.toLowerCase();
}
