import { Pause, Play } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { VoiceNotePlayerState } from "./voice-note.types";

export function VoiceNotePlayButton({
  hasError,
  isOwn,
  isPlaying,
  onTogglePlay,
}: {
  hasError: boolean;
  isOwn: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
}) {
  return (
    <Button
      onClick={onTogglePlay}
      variant="ghost"
      size="icon"
      disabled={hasError}
      aria-label={hasError ? "Voice note unavailable" : "Play voice note"}
      className={cn(
        "size-10 shrink-0 rounded-full transition active:scale-90",
        "disabled:cursor-not-allowed disabled:opacity-60",
        isOwn
          ? "border border-primary/10 bg-primary/10 text-primary hover:bg-primary/20 dark:border-white/10 dark:bg-white/10 dark:text-white hover:dark:bg-white/20"
          : "border border-primary/10 bg-primary/5 text-primary hover:bg-primary/10",
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
}: {
  hasError: boolean;
  isOwn: boolean;
  playbackSpeed: number;
  onToggleSpeed: () => void;
}) {
  return (
    <Button
      onClick={onToggleSpeed}
      variant="subtle"
      size="xs"
      disabled={hasError}
      className={cn(
        "h-8 shrink-0 rounded-lg border px-2 font-black text-xs tabular-nums transition",
        "disabled:cursor-not-allowed disabled:opacity-60",
        isOwn
          ? "border-primary/10 bg-primary/5 text-primary/70 hover:bg-primary/10 dark:border-white/10 dark:bg-white/5 dark:text-white/70 hover:dark:bg-white/10"
          : "border-primary/10 bg-primary/5 text-primary/70 hover:bg-primary/10",
      )}
    >
      {playbackSpeed}x
    </Button>
  );
}

export function VoiceNoteErrorMessage({ hasError }: { hasError: boolean }) {
  if (!hasError) {
    return null;
  }

  return (
    <p className="w-full px-13 font-semibold text-destructive/70 text-xs">
      Voice note unavailable
    </p>
  );
}

export function VoiceNoteTimeInfo({
  formatTime,
  isOwn,
  progress,
  totalDuration,
}: {
  formatTime: VoiceNotePlayerState["formatTime"];
  isOwn: boolean;
  progress: number;
  totalDuration: number;
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
      <span className="tabular-nums">
        {formatTime(totalDuration * progress)}
      </span>
      <span className="tabular-nums">{formatTime(totalDuration)}</span>
    </div>
  );
}
