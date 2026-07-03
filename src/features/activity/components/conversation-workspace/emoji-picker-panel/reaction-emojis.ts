import { COMPACT_REACTION_GROUPS } from "@/features/activity/components/conversation-workspace/emoji-picker-panel/reaction-emojis/compact-reaction-groups";
import { reactionEmoji } from "@/features/activity/components/conversation-workspace/emoji-picker-panel/reaction-emojis/emoji-factory";
import { COMPACT_REACTION_COLUMNS } from "@/features/activity/components/conversation-workspace/emoji-picker-panel/reaction-emojis/layout";
import {
  getReactionEmojiSearchPattern,
  getReactionEmojiSearchText,
} from "@/features/activity/components/conversation-workspace/emoji-picker-panel/reaction-emojis/search";
import { SUGGESTED_REACTION_EMOJIS } from "@/features/activity/components/conversation-workspace/emoji-picker-panel/reaction-emojis/suggested-reaction-emojis";
import type {
  ReactionEmoji,
  ReactionEmojiGroup,
} from "@/features/activity/components/conversation-workspace/emoji-picker-panel/reaction-emojis/types";

export type {
  ReactionEmoji,
  ReactionEmojiGroup,
} from "@/features/activity/components/conversation-workspace/emoji-picker-panel/reaction-emojis/types";

export function chunkReactionEmojis(emojis: readonly ReactionEmoji[]) {
  const rows: ReactionEmoji[][] = [];

  for (
    let index = 0;
    index < emojis.length;
    index += COMPACT_REACTION_COLUMNS
  ) {
    rows.push(emojis.slice(index, index + COMPACT_REACTION_COLUMNS));
  }

  return rows;
}

export function getSuggestedReactionEmojis(suggestedEmojis: readonly string[]) {
  if (suggestedEmojis.length === 0) {
    return SUGGESTED_REACTION_EMOJIS;
  }

  return suggestedEmojis.map((emoji) => {
    return (
      SUGGESTED_REACTION_EMOJIS.find((item) => item.emoji === emoji) ??
      reactionEmoji(emoji, emoji, [])
    );
  });
}

export function getFilteredReactionGroups(
  search: string,
  suggestedReactionEmojis: readonly ReactionEmoji[],
) {
  const groups: ReactionEmojiGroup[] = [
    { title: "Suggested", emojis: suggestedReactionEmojis },
    ...COMPACT_REACTION_GROUPS,
  ];
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return groups;
  }

  const filteredGroups: ReactionEmojiGroup[] = [];
  const searchPattern = getReactionEmojiSearchPattern(normalizedSearch);

  for (const group of groups) {
    const emojis = group.emojis.filter((emoji) =>
      searchPattern.test(getReactionEmojiSearchText(emoji)),
    );

    if (emojis.length > 0) {
      filteredGroups.push({ title: group.title, emojis });
    }
  }

  return filteredGroups;
}
