import { memo } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { useAudioPlayer } from "../../hooks/use-audio-player";

interface VoiceNoteProps {
  url: string;
  duration?: number;
  isOwn?: boolean;
}

/**
 * VoiceNote - Refined, interactive voice message component.
 */
export const VoiceNote = memo(function VoiceNote({
  duration = 120, // Default to 2 mins for demo
  isOwn = false,
}: VoiceNoteProps) {
  const {
    isPlaying,
    progress,
    playbackSpeed,
    bars,
    barCount,
    togglePlay,
    seek,
    toggleSpeed,
    formatTime,
  } = useAudioPlayer();

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    seek(x / rect.width);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 min-w-56 rounded-xl ",
        isOwn ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 w-full",
          isOwn ? "flex-row-reverse" : "flex-row",
        )}
      >
        {/* Play Button */}
        <Button
          onClick={togglePlay}
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10 shrink-0 rounded-full transition active:scale-90",
            isOwn
              ? "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              : "bg-forge-teal/5 hover:bg-forge-teal/10 text-forge-teal border border-forge-teal/10",
          )}
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" strokeWidth={0} />
          ) : (
            <Play
              size={18}
              fill="currentColor"
              strokeWidth={0}
              className="ml-1"
            />
          )}
        </Button>

        {/* Waveform Area */}
        <div
          className="flex-1 h-10 flex items-center gap-0.5 cursor-pointer group/waveform relative"
          onClick={handleSeek}
        >
          {bars.map((bar, i) => {
            const barProgress = i / barCount;
            const isActive = barProgress <= progress;

            return (
              <motion.div
                key={i}
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
                  "w-0.75 rounded-full transition-colors",
                  isActive
                    ? isOwn
                      ? "bg-white"
                      : "bg-forge-teal"
                    : isOwn
                      ? "bg-white/30"
                      : "bg-slate-300",
                )}
              />
            );
          })}

          {/* Progress Head */}
          <motion.div
            className={cn(
              "absolute top-0 bottom-0 w-0.5 pointer-events-none z-10",
              isOwn
                ? "bg-white/60 shadow-[0_0_10px_white]"
                : "bg-forge-teal/60 shadow-[0_0_10px_rgba(var(--color-forge-teal),0.5)]",
            )}
            style={{ left: `${progress * 100}%` }}
            initial={false}
            animate={{ opacity: isPlaying ? 1 : 0 }}
          />
        </div>

        {/* Features: Speed Toggle */}
        <button
          onClick={toggleSpeed}
          type="button"
          className={cn(
            "h-8 px-2 rounded-lg text-micro font-black tabular-nums transition hover:scale-105 active:scale-95 border",
            isOwn
              ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
              : "bg-forge-teal/5 border-forge-teal/10 text-forge-teal/70 hover:bg-forge-teal/10",
          )}
        >
          {playbackSpeed}x
        </button>
      </div>

      {/* Time Info */}
      <div
        className={cn(
          "flex justify-between w-full pr-12 pl-13 text-micro font-bold tracking-tight opacity-50 -mt-1",
          isOwn
            ? "text-primary-foreground flex-row-reverse"
            : "text-slate-muted flex-row",
        )}
      >
        <span className="tabular-nums">{formatTime(duration * progress)}</span>
        <span className="tabular-nums">{formatTime(duration)}</span>
      </div>
    </div>
  );
});
