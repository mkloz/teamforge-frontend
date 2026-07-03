import { domAnimation, LazyMotion, m } from "framer-motion";
import type { MouseEvent } from "react";
import { cn } from "@/shared/lib/utils";
import type { WaveformBar } from "./voice-note.types";

const WAVEFORM_BAR_EASE = "easeInOut" as const;

export function VoiceNoteWaveform({
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
