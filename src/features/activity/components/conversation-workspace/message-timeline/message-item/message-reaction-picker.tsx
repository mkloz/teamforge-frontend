import { Plus } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { getActivityPopupPanelClass } from "@/features/activity/components/activity-popup-styles";
import { ContextMenuItem } from "@/shared/components/ui/context-menu";
import { cn } from "@/shared/lib/utils";

const LazyChatEmojiPickerPanel = lazy(() =>
  import("../../emoji-picker-panel").then((module) => ({
    default: module.ChatEmojiPickerPanel,
  })),
);

const QUICK_REACTION_EMOJIS = [
  "👍",
  "🔥",
  "👏",
  "😂",
  "🎉",
  "🤝",
  "👀",
  "✨",
] as const;

const REACTION_DOCK_CLASS = "mb-1.5 w-full text-ink";

const REACTION_DOCK_CLOUD_CLASS = getActivityPopupPanelClass(
  "flex items-center justify-between gap-0.5 rounded-full p-1",
);

const REACTION_DOCK_PICKER_CLASS = getActivityPopupPanelClass(
  "overflow-hidden rounded-lg",
);

const EMOJI_ITEM_CLASS =
  "flex size-8 min-h-8 justify-center rounded-full p-0 text-base leading-none focus:bg-accent/12 data-[highlighted]:bg-accent/12 data-[state=open]:bg-accent/12";

interface MessageReactionPickerProps {
  canReact: boolean;
  selectedReactionEmojis: readonly string[];
  onRequestClose: () => void;
  onSelectReaction: (emoji: string) => void;
}

export function MessageReactionPicker({
  canReact,
  selectedReactionEmojis,
  onRequestClose,
  onSelectReaction,
}: MessageReactionPickerProps) {
  const [expanded, setExpanded] = useState(false);

  if (!canReact) {
    return null;
  }

  const selectedReactionEmojiSet = new Set(selectedReactionEmojis);

  return (
    <div className={REACTION_DOCK_CLASS}>
      {expanded ? (
        <div className={REACTION_DOCK_PICKER_CLASS}>
          <Suspense fallback={<CompactEmojiPickerSkeleton />}>
            <LazyChatEmojiPickerPanel
              compact
              selectedEmojis={selectedReactionEmojis}
              onSelect={(emoji) => {
                onSelectReaction(emoji);
                onRequestClose();
              }}
            />
          </Suspense>
        </div>
      ) : (
        <div className={REACTION_DOCK_CLOUD_CLASS}>
          {QUICK_REACTION_EMOJIS.slice(0, 6).map((emoji) => {
            const isSelected = selectedReactionEmojiSet.has(emoji);

            return (
              <ContextMenuItem
                key={emoji}
                aria-label={`${
                  isSelected ? "Remove reaction" : "React with"
                } ${emoji}`}
                className={getEmojiItemClass(isSelected)}
                onSelect={() => onSelectReaction(emoji)}
                title={emoji}
              >
                <span aria-hidden="true">{emoji}</span>
              </ContextMenuItem>
            );
          })}
          <ContextMenuItem
            aria-label="More reactions"
            className="flex size-8 min-h-8 justify-center rounded-full border border-accent/35 bg-accent/12 p-0 text-accent text-base leading-none shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent)_14%,transparent)] transition hover:bg-accent/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setExpanded(true);
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setExpanded(true);
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setExpanded(true);
            }}
            onSelect={(event) => {
              event.preventDefault();
              setExpanded(true);
            }}
            title="More reactions"
          >
            <Plus className="size-4" strokeWidth={2.25} />
          </ContextMenuItem>
        </div>
      )}
    </div>
  );
}

function CompactEmojiPickerSkeleton() {
  return (
    <div className="grid grid-cols-8 gap-0.5 p-1.5" aria-hidden="true">
      {QUICK_REACTION_EMOJIS.map((emoji) => (
        <div key={emoji} className="size-7 rounded-md bg-muted/50" />
      ))}
    </div>
  );
}

function getEmojiItemClass(isSelected: boolean) {
  return cn(
    EMOJI_ITEM_CLASS,
    isSelected && "bg-accent/18 shadow-sm ring-1 ring-accent/45",
  );
}
