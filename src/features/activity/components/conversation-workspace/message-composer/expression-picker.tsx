import { Clapperboard, type LucideIcon, Smile } from "lucide-react";
import {
  type KeyboardEvent,
  lazy,
  Suspense,
  startTransition,
  useEffect,
  useId,
  useState,
} from "react";
import { getActivityPopupPanelClass } from "@/features/activity/components/activity-popup-styles";
import type { ActivityOutgoingGifAttachment } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { getBrowserElementById } from "@/shared/lib/browser-environment";
import {
  cancelDelay,
  scheduleAnimationFrame,
  scheduleDelay,
} from "@/shared/lib/browser-scheduling";
import { cn } from "@/shared/lib/utils";

const LazyChatEmojiPickerPanel = lazy(() =>
  import("../emoji-picker-panel").then((module) => ({
    default: module.ChatEmojiPickerPanel,
  })),
);
const LazyGifPickerPanel = lazy(() =>
  import("./giphy-picker-panel").then((module) => ({
    default: module.GifPickerPanel,
  })),
);
const EMOJI_PANEL_OPEN_DELAY_MS = 170;
const EMOJI_PANEL_VIEWPORT_HEIGHT = 328;
const EMOJI_SKELETON_CELLS = Array.from(
  { length: 54 },
  (_, index) => `emoji-skeleton-${index}`,
);
const GIF_SKELETON_CELLS = Array.from(
  { length: 12 },
  (_, index) => `gif-skeleton-${index}`,
);

interface ExpressionPickerProps {
  canSendGif?: boolean;
  disabled: boolean;
  onInsertEmoji: (emoji: string) => void;
  onSelectGif: (gif: ActivityOutgoingGifAttachment) => void;
}

type ExpressionMode = "emoji" | "gif";

export function ExpressionPicker({
  canSendGif = true,
  disabled,
  onInsertEmoji,
  onSelectGif,
}: ExpressionPickerProps) {
  const [open, setOpen] = useState(false);
  const [renderEmojiPanel, setRenderEmojiPanel] = useState(false);
  const [mode, setMode] = useState<ExpressionMode>("emoji");
  const pickerId = useId();
  const emojiTabId = `${pickerId}-emoji-tab`;
  const gifTabId = `${pickerId}-gif-tab`;
  const emojiPanelId = `${pickerId}-emoji-panel`;
  const gifPanelId = `${pickerId}-gif-panel`;

  useEffect(() => {
    if (!open || mode !== "emoji") {
      return undefined;
    }

    const timeoutId = scheduleDelay(() => {
      startTransition(() => setRenderEmojiPanel(true));
    }, EMOJI_PANEL_OPEN_DELAY_MS);

    return () => {
      cancelDelay(timeoutId);
    };
  }, [open, mode]);

  const handleOpenChange = (nextOpen: boolean) => {
    setRenderEmojiPanel(false);
    setOpen(nextOpen);
  };

  const handleModeChange = (nextMode: ExpressionMode) => {
    if (nextMode === mode) {
      return;
    }

    setRenderEmojiPanel(false);
    setMode(nextMode);
  };
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const nextMode = mode === "emoji" ? "gif" : "emoji";
    const nextTabId = nextMode === "emoji" ? emojiTabId : gifTabId;

    handleModeChange(nextMode);
    scheduleAnimationFrame(() => {
      getBrowserElementById(nextTabId)?.focus();
    });
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 cursor-pointer rounded-full text-slate-muted outline-none transition-colors hover:text-accent"
              aria-label="Add emoji or GIF"
              disabled={disabled}
            >
              <Smile className="size-4" strokeWidth={2} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Add emoji or GIF</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={14}
        aria-hidden={!open}
        className={getActivityPopupPanelClass(
          "w-[min(calc(100vw-1.5rem),22rem)] overflow-hidden rounded-lg p-0 will-change-transform data-[state=closed]:pointer-events-none data-[state=closed]:invisible data-[state=closed]:opacity-0",
        )}
      >
        <div className="border-border/55 border-b px-1.5 py-1.5">
          <div
            className="grid grid-cols-2 gap-1"
            role="tablist"
            aria-label="Message expression picker"
          >
            <ExpressionTab
              active={mode === "emoji"}
              controlsId={emojiPanelId}
              icon={Smile}
              id={emojiTabId}
              label="Emoji"
              onKeyDown={handleTabKeyDown}
              onClick={() => handleModeChange("emoji")}
            />
            <ExpressionTab
              active={mode === "gif"}
              controlsId={gifPanelId}
              icon={Clapperboard}
              id={gifTabId}
              label="GIF"
              onKeyDown={handleTabKeyDown}
              onClick={() => handleModeChange("gif")}
            />
          </div>
        </div>

        <div
          id={mode === "emoji" ? emojiPanelId : gifPanelId}
          role="tabpanel"
          aria-labelledby={mode === "emoji" ? emojiTabId : gifTabId}
        >
          {mode === "emoji" ? (
            renderEmojiPanel ? (
              <Suspense fallback={<EmojiPickerSkeleton />}>
                <LazyChatEmojiPickerPanel
                  height={EMOJI_PANEL_VIEWPORT_HEIGHT}
                  onSelect={(emoji) => {
                    onInsertEmoji(emoji);
                    handleOpenChange(false);
                  }}
                />
              </Suspense>
            ) : (
              <EmojiPickerSkeleton />
            )
          ) : (
            <Suspense fallback={<GifPickerSkeleton />}>
              <LazyGifPickerPanel
                canSendGif={canSendGif}
                onSelect={(gif) => {
                  onSelectGif(gif);
                  handleOpenChange(false);
                }}
              />
            </Suspense>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ExpressionTab({
  active,
  controlsId,
  id,
  icon: Icon,
  label,
  onKeyDown,
  onClick,
}: {
  active: boolean;
  controlsId: string;
  id: string;
  icon: LucideIcon;
  label: string;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controlsId}
      tabIndex={active ? 0 : -1}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-full font-black text-xs transition-colors",
        active
          ? "bg-primary/10 text-ink ring-1 ring-primary/20"
          : "text-muted-foreground hover:bg-background/45 hover:text-ink",
      )}
      onKeyDown={onKeyDown}
      onClick={onClick}
    >
      <Icon className="size-3.5" />
      <span>{label}</span>
    </button>
  );
}

function EmojiPickerSkeleton() {
  return (
    <div className="flex h-92 flex-col gap-2 p-2" aria-hidden="true">
      <div className="h-8 rounded-full bg-muted/60" />
      <div className="grid grid-cols-9 gap-1">
        {EMOJI_SKELETON_CELLS.map((cell) => (
          <div key={cell} className="aspect-square rounded-md bg-muted/50" />
        ))}
      </div>
    </div>
  );
}

function GifPickerSkeleton() {
  return (
    <div className="flex h-92 flex-col gap-2 p-2">
      <div className="h-8 rounded-full bg-muted/60" />
      <div className="grid grid-cols-3 gap-2">
        {GIF_SKELETON_CELLS.map((cell) => (
          <div key={cell} className="aspect-square rounded-lg bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
