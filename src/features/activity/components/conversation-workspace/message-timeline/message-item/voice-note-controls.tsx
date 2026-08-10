import { Pause, Play } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { VoiceNotePlayerState } from "./voice-note.types";

export function VoiceNotePlayButton({
  hasError,
  isLoading,
  isOwn,
  isPlaying,
  onTogglePlay,
  errorDescriptionId,
  voiceNoteLabel,
}: {
  hasError: boolean;
  isLoading: boolean;
  isOwn: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  errorDescriptionId?: string;
  voiceNoteLabel: string;
}) {
  const label = hasError
    ? `Retry ${voiceNoteLabel.toLowerCase()}`
    : isPlaying
      ? `Pause ${voiceNoteLabel.toLowerCase()}`
      : `Play ${voiceNoteLabel.toLowerCase()}`;

  return (
    <Button
      onClick={onTogglePlay}
      variant="ghost"
      size="icon"
      loading={isLoading}
      aria-describedby={hasError ? errorDescriptionId : undefined}
      aria-label={label}
      contentClassName={cn(
        "size-10 shrink-0 rounded-full border",
        isOwn
          ? "border-primary/10 bg-primary-soft group-hover/play:bg-primary/20 dark:border-white/10 dark:bg-white/10 dark:group-hover/play:bg-white/20"
          : "border-primary/10 bg-primary-soft group-hover/play:brightness-110",
      )}
      className={cn(
        "group/play size-11 shrink-0 rounded-full border-0 bg-transparent p-0 shadow-none active:scale-95",
        isOwn ? "text-foreground dark:text-white" : "text-foreground",
      )}
    >
      {isPlaying ? (
        <Pause className="size-5" fill="currentColor" strokeWidth={0} />
      ) : (
        <Play className="ml-1 size-5" fill="currentColor" strokeWidth={0} />
      )}
    </Button>
  );
}

export function VoiceNoteSpeedButton({
  hasError,
  isOwn,
  playbackSpeed,
  onToggleSpeed,
  errorDescriptionId,
  voiceNoteLabel,
}: {
  hasError: boolean;
  isOwn: boolean;
  playbackSpeed: number;
  onToggleSpeed: () => void;
  errorDescriptionId?: string;
  voiceNoteLabel: string;
}) {
  return (
    <Button
      onClick={onToggleSpeed}
      variant="subtle"
      size="xs"
      disabled={hasError}
      aria-describedby={hasError ? errorDescriptionId : undefined}
      aria-label={`${voiceNoteLabel} playback speed ${playbackSpeed} times; change speed`}
      contentClassName={cn(
        "h-8 w-auto min-w-10 rounded-lg border px-2",
        isOwn
          ? "border-primary/10 bg-primary-soft group-hover/speed:brightness-110 dark:border-white/10 dark:bg-white/5 dark:group-hover/speed:bg-white/10"
          : "border-primary/10 bg-primary-soft group-hover/speed:brightness-110",
      )}
      className={cn(
        "group/speed h-11 min-w-11 shrink-0 rounded-lg border-0 bg-transparent p-0 font-black text-xs tabular-nums shadow-none active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-60",
        isOwn ? "text-foreground/70 dark:text-white/70" : "text-foreground/70",
      )}
    >
      {playbackSpeed}x
    </Button>
  );
}

export function VoiceNoteErrorMessage({
  hasError,
  id,
}: {
  hasError: boolean;
  id: string;
}) {
  if (!hasError) {
    return null;
  }

  return (
    <p
      className="w-full px-13 font-semibold text-destructive/70 text-xs"
      id={id}
      role="alert"
    >
      Voice note unavailable
    </p>
  );
}

export function VoiceNoteTimeInfo({
  formatTime,
  isOwn,
  totalDuration,
  currentTimeSeconds,
}: {
  formatTime: VoiceNotePlayerState["formatTime"];
  isOwn: boolean;
  totalDuration: number | null;
  currentTimeSeconds: number;
}) {
  return (
    <div
      className={cn(
        "-mt-1 flex w-full justify-between pr-12 pl-13 font-bold text-xs tracking-tight opacity-50",
        isOwn
          ? "flex-row-reverse text-slate-muted"
          : "flex-row text-slate-muted",
      )}
    >
      <span className="tabular-nums">{formatTime(currentTimeSeconds)}</span>
      <span className="tabular-nums">
        {totalDuration === null ? "--:--" : formatTime(totalDuration)}
      </span>
    </div>
  );
}
