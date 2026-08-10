import type { ChangeEvent, KeyboardEvent } from "react";
import { cn } from "@/shared/lib/utils";
import type { WaveformBar } from "./voice-note.types";
import {
  getVoiceNoteKeyboardSeekTarget,
  getVoiceNoteValueText,
} from "./voice-note-waveform-utils";

export function VoiceNoteWaveform({
  bars,
  currentTimeSeconds,
  durationSeconds,
  hasError,
  isOwn,
  label,
  onSeek,
  progress,
  errorDescriptionId,
}: {
  bars: WaveformBar[];
  currentTimeSeconds: number;
  durationSeconds: number | null;
  hasError: boolean;
  isOwn: boolean;
  label: string;
  onSeek: (seconds: number) => void;
  progress: number;
  errorDescriptionId?: string;
}) {
  const hasSeekableDuration = durationSeconds !== null;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onSeek(Number(event.currentTarget.value));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!durationSeconds) {
      return;
    }

    const target = getVoiceNoteKeyboardSeekTarget({
      currentSeconds: currentTimeSeconds,
      durationSeconds,
      event: {
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        isComposing: event.nativeEvent.isComposing,
        key: event.key,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
      },
    });
    if (target === null) {
      return;
    }

    event.preventDefault();
    onSeek(target);
  }

  return (
    <div
      className={cn(
        "group/waveform relative flex h-10 min-w-0 flex-1 items-center gap-0.5 rounded-md",
        "has-[input:focus-visible]:ring-1 has-[input:focus-visible]:ring-foreground has-[input:focus-visible]:ring-offset-2 has-[input:focus-visible]:ring-offset-background",
        hasError && "opacity-55",
      )}
      data-voice-note-waveform
    >
      <div
        aria-hidden="true"
        className="pointer-events-none flex size-full items-center gap-0.5"
      >
        {bars.map((bar, index) => (
          <VoiceNoteWaveformBar
            key={bar.id}
            bar={bar}
            index={index}
            isOwn={isOwn}
            progress={progress}
            totalBars={bars.length}
          />
        ))}

        <VoiceNoteProgressHead isOwn={isOwn} progress={progress} />
      </div>

      {hasSeekableDuration ? (
        <input
          aria-describedby={hasError ? errorDescriptionId : undefined}
          aria-label={label}
          aria-valuetext={getVoiceNoteValueText(
            currentTimeSeconds,
            durationSeconds,
          )}
          className="absolute inset-x-0 top-1/2 z-20 h-11 -translate-y-1/2 cursor-pointer touch-pan-y appearance-none bg-transparent opacity-0 focus:outline-none disabled:cursor-not-allowed forced-colors:appearance-auto forced-colors:opacity-100"
          data-voice-note-seek
          dir="ltr"
          disabled={hasError}
          max={durationSeconds}
          min={0}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          step={1}
          type="range"
          value={Math.min(currentTimeSeconds, durationSeconds)}
        />
      ) : null}
    </div>
  );
}

function VoiceNoteWaveformBar({
  bar,
  index,
  isOwn,
  progress,
  totalBars,
}: {
  bar: WaveformBar;
  index: number;
  isOwn: boolean;
  progress: number;
  totalBars: number;
}) {
  const barProgress = index / totalBars;
  const isActive = barProgress <= progress;

  return (
    <span
      className={cn(
        "w-px rounded-full transition-opacity duration-150 motion-reduce:transition-none",
        isActive
          ? isOwn
            ? "bg-primary dark:bg-white"
            : "bg-primary"
          : isOwn
            ? "bg-primary/30 opacity-45 dark:bg-white/30"
            : "bg-slate-muted/35 opacity-45",
      )}
      style={{ height: `${bar.height}%` }}
    />
  );
}

function VoiceNoteProgressHead({
  isOwn,
  progress,
}: {
  isOwn: boolean;
  progress: number;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-1/2 z-10 h-8 w-0.5 -translate-y-1/2 rounded-full after:absolute after:top-1/2 after:left-1/2 after:size-2.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-current",
        isOwn
          ? "bg-primary text-primary dark:bg-white dark:text-white"
          : "bg-primary text-primary",
      )}
      style={{ left: `${progress * 100}%` }}
    />
  );
}
