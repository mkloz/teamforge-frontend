export interface ReactionEmoji {
  emoji: string;
  label: string;
  tags: readonly string[];
}

export interface ReactionEmojiGroup {
  emojis: readonly ReactionEmoji[];
  title: string;
}
