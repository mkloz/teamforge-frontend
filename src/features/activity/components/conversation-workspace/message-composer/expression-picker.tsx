import { Clapperboard, type LucideIcon, Smile } from "lucide-react";
import {
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";

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
  allowGif?: boolean;
  canSendGif?: boolean;
  disabled: boolean;
  onInsertEmoji: (emoji: string) => void;
  onSelectGif: (gif: ActivityOutgoingGifAttachment) => void;
}

type ExpressionMode = "emoji" | "gif";

export function ExpressionPicker({
  allowGif = true,
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
  const activeMode = allowGif ? mode : "emoji";

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

  useEffect(() => {
    if (!allowGif && mode === "gif") {
      setMode("emoji");
    }
  }, [allowGif, mode]);

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
  const panelContent =
    activeMode === "emoji" ? (
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
    );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-11 cursor-pointer rounded-full text-slate-muted outline-none transition-colors hover:text-accent [@media(pointer:fine)]:size-8"
              aria-label={allowGif ? "Add emoji or GIF" : "Add emoji"}
              disabled={disabled}
            >
              <Smile className="size-4" strokeWidth={2} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {allowGif ? "Add emoji or GIF" : "Add emoji"}
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={14}
        aria-hidden={!open}
        className={getActivityPopupPanelClass(
          "max-h-(--radix-popover-content-available-height) w-[min(calc(100vw-1.5rem),22rem)] overflow-y-auto rounded-lg p-0 will-change-transform data-[state=closed]:pointer-events-none data-[state=closed]:invisible data-[state=closed]:opacity-0",
        )}
      >
        {allowGif ? (
          <Tabs
            className="gap-0"
            value={activeMode}
            onValueChange={(value) => {
              if (value === "emoji" || value === "gif") {
                handleModeChange(value);
              }
            }}
          >
            <div className="border-border/55 border-b px-1.5 py-1.5">
              <TabsList
                aria-label="Message expression picker"
                className="grid h-auto w-full grid-cols-2 gap-1 bg-transparent p-0"
              >
                <ExpressionTab
                  controlsId={emojiPanelId}
                  icon={Smile}
                  id={emojiTabId}
                  label="Emoji"
                  value="emoji"
                />
                <ExpressionTab
                  controlsId={gifPanelId}
                  icon={Clapperboard}
                  id={gifTabId}
                  label="GIF"
                  value="gif"
                />
              </TabsList>
            </div>
            <TabsContent
              aria-labelledby={activeMode === "emoji" ? emojiTabId : gifTabId}
              id={activeMode === "emoji" ? emojiPanelId : gifPanelId}
              value={activeMode}
            >
              {panelContent}
            </TabsContent>
          </Tabs>
        ) : (
          <div id={emojiPanelId}>{panelContent}</div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function ExpressionTab({
  controlsId,
  id,
  icon: Icon,
  label,
  value,
}: {
  controlsId: string;
  id: string;
  icon: LucideIcon;
  label: string;
  value: ExpressionMode;
}) {
  return (
    <TabsTrigger
      id={id}
      aria-controls={controlsId}
      className="h-9 rounded-full font-black text-muted-foreground text-xs shadow-none hover:bg-background/45 hover:text-ink data-[state=active]:bg-primary/10 data-[state=active]:text-ink data-[state=active]:ring-1 data-[state=active]:ring-primary/20"
      value={value}
    >
      <Icon className="size-3.5" />
      <span>{label}</span>
    </TabsTrigger>
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
