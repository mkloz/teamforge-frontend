import { CompactReactionEmojiPicker } from "./emoji-picker-panel/compact-reaction-emoji-picker";
import { FullEmojiPickerPanel } from "./emoji-picker-panel/full-emoji-picker-panel";
import {
  EMPTY_EMOJI_OPTIONS,
  SelectedEmojiContext,
} from "./emoji-picker-panel/selected-emoji-context";

interface ChatEmojiPickerPanelProps {
  compact?: boolean;
  height?: number;
  onCollapse?: () => void;
  onSelect: (emoji: string) => void;
  searchDisabled?: boolean;
  selectedEmojis?: readonly string[];
  showPreview?: boolean;
  skinTonesDisabled?: boolean;
  suggestedEmojis?: readonly string[];
}

export function ChatEmojiPickerPanel({
  compact = false,
  height,
  onCollapse,
  onSelect,
  searchDisabled = false,
  selectedEmojis = EMPTY_EMOJI_OPTIONS,
  showPreview = false,
  skinTonesDisabled = true,
  suggestedEmojis = EMPTY_EMOJI_OPTIONS,
}: ChatEmojiPickerPanelProps) {
  const picker = compact ? (
    <CompactReactionEmojiPicker
      onSelect={onSelect}
      suggestedEmojis={suggestedEmojis}
    />
  ) : (
    <FullEmojiPickerPanel
      height={height}
      onCollapse={onCollapse}
      onSelect={onSelect}
      searchDisabled={searchDisabled}
      showPreview={showPreview}
      skinTonesDisabled={skinTonesDisabled}
    />
  );

  return (
    <SelectedEmojiContext.Provider value={selectedEmojis}>
      {picker}
    </SelectedEmojiContext.Provider>
  );
}
