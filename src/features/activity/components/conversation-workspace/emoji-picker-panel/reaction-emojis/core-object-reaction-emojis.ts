import { reactionEmoji } from "@/features/activity/components/conversation-workspace/emoji-picker-panel/reaction-emojis/emoji-factory";

export const CORE_OBJECT_REACTION_EMOJIS = [
  reactionEmoji("📚", "Books", ["study", "read"]),
  reactionEmoji("💡", "Light bulb", ["idea", "smart"]),
  reactionEmoji("📍", "Map pin", ["location", "place"]),
  reactionEmoji("🏆", "Trophy", ["win", "award"]),
  reactionEmoji("🥇", "Gold medal", ["win", "first"]),
] as const;
