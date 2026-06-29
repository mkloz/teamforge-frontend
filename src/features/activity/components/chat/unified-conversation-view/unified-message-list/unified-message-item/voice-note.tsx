import { domAnimation, LazyMotion, m } from "framer-motion";
import { Pause, Play } from "lucide-react";
import type { MouseEvent } from "react";
import { useAudioPlayer } from "@/features/activity/hooks/use-audio-player";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface VoiceNoteProps {
  url: string;
  duration?: number;
  isOwn?: boolean;
}

type AudioPlayerState = ReturnType<typeof useAudioPlayer>;
type WaveformBar = AudioPlayerState["bars"][number];

const WAVEFORM_BAR_EASE = "easeInOut" as const;

function getVoiceNoteDuration(
  durationSeconds: number,
  fallbackDuration: number,
) {
  return durationSeconds > 0 ? durationSeconds : fallbackDuration;
}

function getSeekRatio(event: MouseEvent<HTMLButtonElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;

  return x / rect.width;
}

function getWaveformBarClassName({
  isActive,
  isOwn,
}: {
  isActive: boolean;
  isOwn: boolean;
}) {
  return cn(
    "w-px rounded-full transition-colors",
    isActive
      ? isOwn
        ? "bg-primary dark:bg-white"
        : "bg-primary"
      : isOwn
        ? "bg-primary/30 dark:bg-white/30"
        : "bg-slate-muted/35",
  );
}

function getWaveformBarTransition({
  index,
  isActive,
  isPlaying,
}: {
  index: number;
  isActive: boolean;
  isPlaying: boolean;
}) {
  return {
    height: { duration: 0.3 },
    opacity: { duration: 0.2 },
    scaleY:
      isPlaying && isActive
        ? {
            repeat: Infinity,
            duration: 0.5 + Math.abs(Math.sin(index * 12.9898)) * 0.2,
            ease: WAVEFORM_BAR_EASE,
            delay: index * 0.03,
          }
        : { duration: 0.2 },
  };
}

/**
 * VoiceNote - Refined, interactive voice message component.
 */
export function VoiceNote({
  url,
  duration = 120, // Default to 2 mins for demo
  isOwn = false,
}: VoiceNoteProps) {
  const audioPlayer = useAudioPlayer(url);
  const totalDuration = getVoiceNoteDuration(
    audioPlayer.durationSeconds,
    duration,
  );

  const handleSeek = (event: MouseEvent<HTMLButtonElement>) => {
    audioPlayer.seek(getSeekRatio(event));
  };

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
        <VoiceNotePlayButton
          hasError={audioPlayer.hasError}
          isOwn={isOwn}
          isPlaying={audioPlayer.isPlaying}
          onTogglePlay={audioPlayer.togglePlay}
        />

        <VoiceNoteWaveform
          barCount={audioPlayer.barCount}
          bars={audioPlayer.bars}
          isOwn={isOwn}
          isPlaying={audioPlayer.isPlaying}
          progress={audioPlayer.progress}
          onSeek={handleSeek}
        />

        <VoiceNoteSpeedButton
          hasError={audioPlayer.hasError}
          isOwn={isOwn}
          playbackSpeed={audioPlayer.playbackSpeed}
          onToggleSpeed={audioPlayer.toggleSpeed}
        />
      </div>

      <VoiceNoteErrorMessage hasError={audioPlayer.hasError} />

      <VoiceNoteTimeInfo
        formatTime={audioPlayer.formatTime}
        isOwn={isOwn}
        progress={audioPlayer.progress}
        totalDuration={totalDuration}
      />
    </div>
  );
}

function VoiceNotePlayButton({
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

function VoiceNoteWaveform({
  barCount,
  bars,
  isOwn,
  isPlaying,
  progress,
  onSeek,
}: {
  barCount: number;
  bars: WaveformBar[];
  isOwn: boolean;
  isPlaying: boolean;
  progress: number;
  onSeek: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <LazyMotion features={domAnimation}>
      <button
        type="button"
        aria-label="Seek voice note"
        className="group/waveform relative flex h-10 flex-1 cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0"
        onClick={onSeek}
      >
        {bars.map((bar, index) => (
          <VoiceNoteWaveformBar
            key={bar.id}
            bar={bar}
            barCount={barCount}
            index={index}
            isOwn={isOwn}
            isPlaying={isPlaying}
            progress={progress}
          />
        ))}

        <VoiceNoteProgressHead
          isOwn={isOwn}
          isPlaying={isPlaying}
          progress={progress}
        />
      </button>
    </LazyMotion>
  );
}

function VoiceNoteWaveformBar({
  bar,
  barCount,
  index,
  isOwn,
  isPlaying,
  progress,
}: {
  bar: WaveformBar;
  barCount: number;
  index: number;
  isOwn: boolean;
  isPlaying: boolean;
  progress: number;
}) {
  const barProgress = index / barCount;
  const isActive = barProgress <= progress;

  return (
    <m.div
      initial={false}
      animate={{
        height: `${bar.height}%`,
        opacity: isActive ? 1 : 0.3,
        scaleY: isPlaying && isActive ? [1, 1.25, 1] : 1,
      }}
      transition={getWaveformBarTransition({
        index,
        isActive,
        isPlaying,
      })}
      className={getWaveformBarClassName({ isActive, isOwn })}
    />
  );
}

function VoiceNoteProgressHead({
  isOwn,
  isPlaying,
  progress,
}: {
  isOwn: boolean;
  isPlaying: boolean;
  progress: number;
}) {
  return (
    <m.div
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
  );
}

function VoiceNoteSpeedButton({
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

function VoiceNoteErrorMessage({ hasError }: { hasError: boolean }) {
  if (!hasError) {
    return null;
  }

  return (
    <p className="w-full px-13 font-semibold text-destructive/70 text-micro">
      Voice note unavailable
    </p>
  );
}

function VoiceNoteTimeInfo({
  formatTime,
  isOwn,
  progress,
  totalDuration,
}: {
  formatTime: AudioPlayerState["formatTime"];
  isOwn: boolean;
  progress: number;
  totalDuration: number;
}) {
  return (
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
  );
}
