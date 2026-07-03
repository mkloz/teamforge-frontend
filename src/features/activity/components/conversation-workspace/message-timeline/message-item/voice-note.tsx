import type { MouseEvent } from "react";
import { useAudioPlayer } from "@/features/activity/hooks/use-audio-player";
import { cn } from "@/shared/lib/utils";
import {
  VoiceNoteErrorMessage,
  VoiceNotePlayButton,
  VoiceNoteSpeedButton,
  VoiceNoteTimeInfo,
} from "./voice-note-controls";
import { VoiceNoteWaveform } from "./voice-note-waveform";
import { getSeekRatio } from "./voice-note-waveform-utils";

interface VoiceNoteProps {
  url: string;
  duration?: number;
  isOwn?: boolean;
}

function getVoiceNoteDuration(
  durationSeconds: number,
  fallbackDuration: number,
) {
  return durationSeconds > 0 ? durationSeconds : fallbackDuration;
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
