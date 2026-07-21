import {
  EmojiPicker,
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListComponents,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
} from "frimousse";
import { ChevronLeft, Search } from "lucide-react";
import { use } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { SelectedEmojiContext } from "./selected-emoji-context";

const EMOJI_SKELETON_CELLS = Array.from(
  { length: 54 },
  (_, index) => `emoji-skeleton-${index}`,
);

const EMOJI_PICKER_ROOT_CLASS =
  "w-full overflow-hidden bg-popover/97 font-sans text-popover-foreground shadow-none";

const DEFAULT_EMOJI_LIST_COMPONENTS = {
  CategoryHeader: EmojiCategoryHeader,
  Emoji: EmojiButton,
  Row: EmojiRow,
} satisfies Partial<EmojiPickerListComponents>;

const VIEWPORT_HEIGHT_CLASS_RULES = [
  {
    className: "h-44",
    matches: (height?: number) => Boolean(height && height <= 184),
  },
  {
    className: "h-64",
    matches: (height?: number) => Boolean(height && height <= 256),
  },
  {
    className: "h-82",
    matches: (height?: number) => Boolean(height && height >= 328),
  },
  {
    className: "h-80",
    matches: (height?: number) => Boolean(height && height >= 320),
  },
] as const;

export function FullEmojiPickerPanel({
  height,
  onCollapse,
  onSelect,
  searchDisabled,
  showPreview,
  skinTonesDisabled,
}: {
  height?: number;
  onCollapse?: () => void;
  onSelect: (emoji: string) => void;
  searchDisabled: boolean;
  showPreview: boolean;
  skinTonesDisabled: boolean;
}) {
  const shouldShowToolbar = !searchDisabled || !skinTonesDisabled;
  const viewportHeightClass = getViewportHeightClass(height);

  return (
    <EmojiPicker.Root
      className={EMOJI_PICKER_ROOT_CLASS}
      columns={9}
      onEmojiSelect={({ emoji }) => onSelect(emoji)}
      skinTone="none"
    >
      {shouldShowToolbar ? (
        <EmojiPickerToolbar
          onCollapse={onCollapse}
          searchDisabled={searchDisabled}
          skinTonesDisabled={skinTonesDisabled}
        />
      ) : null}

      <EmojiPicker.Viewport
        className={cn(
          "scrollbar-hide min-h-0 px-1 pt-0 pb-1 outline-none",
          viewportHeightClass,
        )}
      >
        <EmojiPicker.Loading className="block">
          <EmojiPickerSkeleton compact={false} />
        </EmojiPicker.Loading>
        <EmojiPicker.Empty className="flex h-full items-center justify-center px-6 text-center font-semibold text-slate-muted text-xs">
          {({ search }) =>
            search.trim()
              ? `No emoji found for "${search.trim()}".`
              : "No emoji found."
          }
        </EmojiPicker.Empty>
        <EmojiPicker.List components={DEFAULT_EMOJI_LIST_COMPONENTS} />
      </EmojiPicker.Viewport>

      {showPreview ? <EmojiPickerPreview /> : null}
    </EmojiPicker.Root>
  );
}

function EmojiPickerToolbar({
  onCollapse,
  searchDisabled,
  skinTonesDisabled,
}: {
  onCollapse?: () => void;
  searchDisabled: boolean;
  skinTonesDisabled: boolean;
}) {
  return (
    <div className="flex items-center gap-2 border-border/55 border-b px-2 pt-1.5 pb-0">
      {onCollapse ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Back to quick reactions"
          className="size-8 shrink-0 rounded-lg border border-border/55 bg-input text-slate-muted focus-visible:ring-primary/18 hover:enabled:border-primary/35 hover:enabled:bg-primary/8 hover:enabled:text-ink"
          onClick={onCollapse}
        >
          <ChevronLeft className="size-4" />
        </Button>
      ) : null}
      {!searchDisabled ? <EmojiPickerSearch /> : null}
      {!skinTonesDisabled ? (
        <EmojiPicker.SkinToneSelector className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-input text-base transition-colors hover:border-primary/35 hover:bg-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/18" />
      ) : null}
    </div>
  );
}

function EmojiPickerSearch() {
  return (
    <div className="relative min-w-0 flex-1">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-muted"
        aria-hidden="true"
        strokeWidth={2}
      />
      <EmojiPicker.Search
        className="h-8 w-full border-0 bg-transparent pr-2 pl-8 font-bold text-ink text-xs outline-none transition-colors placeholder:text-slate-muted/70 focus-visible:ring-0"
        name="emoji-search"
        aria-label="Search emoji"
        placeholder="Search emoji"
      />
    </div>
  );
}

function EmojiPickerPreview() {
  return (
    <EmojiPicker.ActiveEmoji>
      {({ emoji }) => (
        <div className="flex min-h-11 items-center gap-2 border-border/55 border-t px-2.5 py-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/8 font-sans text-xl">
            {emoji?.emoji}
          </span>
          <span className="min-w-0 truncate font-bold text-slate-muted text-xs">
            {emoji?.label ?? "Pick an emoji"}
          </span>
        </div>
      )}
    </EmojiPicker.ActiveEmoji>
  );
}

function getViewportHeightClass(height?: number) {
  return (
    VIEWPORT_HEIGHT_CLASS_RULES.find((rule) => rule.matches(height))
      ?.className ?? "h-72"
  );
}

function EmojiCategoryHeader({
  category,
  className,
  ...props
}: EmojiPickerListCategoryHeaderProps) {
  return (
    <div
      {...props}
      className={cn(
        "z-10 flex h-6 items-center bg-popover/94 px-2 font-black text-slate-muted text-xs backdrop-blur-md",
        className,
      )}
    >
      {category.label}
    </div>
  );
}

function EmojiRow(props: EmojiPickerListRowProps) {
  return <EmojiRowBase {...props} compact={false} />;
}

function EmojiRowBase({
  className,
  compact,
  ...props
}: EmojiPickerListRowProps & { compact: boolean }) {
  return (
    <div
      {...props}
      className={cn("gap-0.5 px-1", compact && "gap-0 px-0.5", className)}
    />
  );
}

function EmojiButton(props: EmojiPickerListEmojiProps) {
  return <EmojiButtonBase {...props} compact={false} />;
}

function EmojiButtonBase({
  className,
  compact,
  emoji,
  ...props
}: EmojiPickerListEmojiProps & { compact: boolean }) {
  const selectedEmojis = use(SelectedEmojiContext);
  const isSelected = selectedEmojis.includes(emoji.emoji);

  return (
    <button
      {...props}
      type="button"
      aria-pressed={isSelected}
      className={cn(
        "flex min-w-0 flex-1 items-center justify-center rounded-md text-lg leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/18",
        compact ? "h-7 text-base" : "h-8",
        isSelected
          ? "bg-accent/18 shadow-sm ring-1 ring-accent/45 hover:bg-accent/22"
          : "hover:bg-primary/10",
        emoji.isActive && !isSelected && "bg-primary/10",
        className,
      )}
    >
      <span aria-hidden="true">{emoji.emoji}</span>
    </button>
  );
}

function EmojiPickerSkeleton({ compact }: { compact: boolean }) {
  return (
    <div className={cn("p-2", compact && "p-1.5")}>
      <div
        className={cn("mb-2 h-6 rounded-md bg-muted/70", !compact && "h-7")}
      />
      <div className={cn("grid grid-cols-9 gap-1", compact && "grid-cols-8")}>
        {EMOJI_SKELETON_CELLS.map((cell) => (
          <div key={cell} className="aspect-square rounded-md bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
