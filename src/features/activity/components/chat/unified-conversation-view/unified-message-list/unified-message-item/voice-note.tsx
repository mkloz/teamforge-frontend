import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import type { MouseEvent } from "react";
import { memo } from "react";
import { useAudioPlayer } from "@/features/activity/hooks/use-audio-player";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface VoiceNoteProps {
  url: string;
  duration?: number;
  isOwn?: boolean;
}

/**
 * VoiceNote - Refined, interactive voice message component.
 */
export const VoiceNote = memo(function VoiceNote({
  url,
  duration = 120, // Default to 2 mins for demo
  isOwn = false,
}: VoiceNoteProps) {
  const {
    isPlaying,
    hasError,
    progress,
    playbackSpeed,
    bars,
    barCount,
    durationSeconds,
    togglePlay,
    seek,
    toggleSpeed,
    formatTime,
  } = useAudioPlayer(url);

  const handleSeek = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    seek(x / rect.width);
  };

  const totalDuration = durationSeconds > 0 ? durationSeconds : duration;

  return (
    <div
      className={cn(
        "flex min-w-56 flex-col gap-0.5 rounded-xl",
        isOwn ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "flex w-full items-center gap-3",
          isOwn ? "flex-row-reverse" : "flex-row",
        )}
      >
        {/* Play Button */}
        <Button
          onClick={togglePlay}
          variant="ghost"
          size="icon"
          disabled={hasError}
          aria-label={hasError ? "Voice note unavailable" : "Play voice note"}
          className={cn(
            "size-10 shrink-0 rounded-full transition active:scale-90",
            "disabled:cursor-not-allowed disabled:opacity-60",
            isOwn
              ? "border border-primary/10 bg-primary/10 text-primary hover:bg-primary/20 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              : "border border-primary/10 bg-primary/5 text-primary hover:bg-primary/10",
          )}
        >
          {isPlaying ? (
            <Pause className="size-5" fill="currentColor" strokeWidth={0} />
          ) : (
            <Play className="ml-1 size-5" fill="currentColor" strokeWidth={0} />
          )}
        </Button>

        {/* Waveform Area */}
        <button
          type="button"
          aria-label="Seek voice note"
          className="group/waveform relative flex h-10 flex-1 cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0"
          onClick={handleSeek}
        >
          {bars.map((bar, i) => {
            const barProgress = i / barCount;
            const isActive = barProgress <= progress;

            return (
              <motion.div
                key={bar.id}
                initial={false}
                animate={{
                  height: `${bar.height}%`,
                  opacity: isActive ? 1 : 0.3,
                  scaleY: isPlaying && isActive ? [1, 1.25, 1] : 1,
                }}
                transition={{
                  height: { duration: 0.3 },
                  opacity: { duration: 0.2 },
                  scaleY:
                    isPlaying && isActive
                      ? {
                          repeat: Infinity,
                          duration: 0.5 + Math.abs(Math.sin(i * 12.9898)) * 0.2,
                          ease: "easeInOut",
                          delay: i * 0.03,
                        }
                      : { duration: 0.2 },
                }}
                className={cn(
                  "w-px rounded-full transition-colors",
                  isActive
                    ? isOwn
                      ? "bg-primary dark:bg-white"
                      : "bg-primary"
                    : isOwn
                      ? "bg-primary/30 dark:bg-white/30"
                      : "bg-slate-muted/35",
                )}
              />
            );
          })}

          {/* Progress Head */}
          <motion.div
            className={cn(
              "pointer-events-none absolute top-0 bottom-0 z-10 w-0.5",
              isOwn
                ? "bg-primary/60 shadow-lg dark:bg-white/60"
                : "bg-primary/60 shadow-lg",
            )}
            style={{ left: `${progress * 100}%` }}
            initial={false}
            animate={{ opacity: isPlaying ? 1 : 0 }}
          />
        </button>

        {/* Features: Speed Toggle */}
        <Button
          onClick={toggleSpeed}
          variant="subtle"
          size="xs"
          disabled={hasError}
          className={cn(
            "h-8 shrink-0 rounded-lg border px-2 font-black text-xs tabular-nums transition",
            "disabled:cursor-not-allowed disabled:opacity-60",
            isOwn
              ? "border-primary/10 bg-primary/5 text-primary/70 hover:bg-primary/10 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
              : "border-primary/10 bg-primary/5 text-primary/70 hover:bg-primary/10",
          )}
        >
          {playbackSpeed}x
        </Button>
      </div>

      {hasError && (
        <p className="w-full px-13 font-semibold text-destructive/70 text-micro">
          Voice note unavailable
        </p>
      )}

      {/* Time Info */}
      <div
        className={cn(
          "-mt-1 flex w-full justify-between pr-12 pl-13 font-bold text-micro tracking-tight opacity-50",
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
    </div>
  );
});
