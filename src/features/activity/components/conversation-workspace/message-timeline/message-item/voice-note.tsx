import { useId } from "react";
import { useAudioPlayer } from "@/features/activity/hooks/use-audio-player";
import { cn } from "@/shared/lib/utils";
import {
  VoiceNoteErrorMessage,
  VoiceNotePlayButton,
  VoiceNoteSpeedButton,
  VoiceNoteTimeInfo,
} from "./voice-note-controls";
import { VoiceNoteWaveform } from "./voice-note-waveform";

interface VoiceNoteProps {
  url: string;
  duration?: number;
  isOwn?: boolean;
  accessibleLabel?: string;
}

/** Plays a voice message with semantic seek and speed controls. */
export function VoiceNote({
  url,
  duration,
  isOwn = false,
  accessibleLabel = "Voice note",
}: VoiceNoteProps) {
  const audioPlayer = useAudioPlayer(url, duration);
  const errorDescriptionId = `${useId()}-voice-note-error`;
  const playButton = (
    <VoiceNotePlayButton
      errorDescriptionId={errorDescriptionId}
      hasError={audioPlayer.hasError}
      isLoading={audioPlayer.isLoading}
      isOwn={isOwn}
      isPlaying={audioPlayer.isPlaying}
      voiceNoteLabel={accessibleLabel}
      onTogglePlay={audioPlayer.togglePlay}
    />
  );
  const waveform = (
    <VoiceNoteWaveform
      bars={audioPlayer.bars}
      currentTimeSeconds={audioPlayer.currentTimeSeconds}
      durationSeconds={audioPlayer.totalDurationSeconds}
      errorDescriptionId={errorDescriptionId}
      hasError={audioPlayer.hasError}
      isOwn={isOwn}
      label={`${accessibleLabel} position`}
      onSeek={audioPlayer.seek}
      progress={audioPlayer.progress}
    />
  );
  const speedButton = (
    <VoiceNoteSpeedButton
      errorDescriptionId={errorDescriptionId}
      hasError={audioPlayer.hasError}
      isOwn={isOwn}
      playbackSpeed={audioPlayer.playbackSpeed}
      voiceNoteLabel={accessibleLabel}
      onToggleSpeed={audioPlayer.toggleSpeed}
    />
  );

  return (
    <div
      className={cn(
        "flex min-w-56 flex-col gap-0.5 rounded-xl",
        isOwn ? "items-end" : "items-start",
      )}
    >
      <div
        aria-busy={audioPlayer.isLoading}
        className="flex w-full items-center gap-3"
      >
        {isOwn ? (
          <>
            {speedButton}
            {waveform}
            {playButton}
          </>
        ) : (
          <>
            {playButton}
            {waveform}
            {speedButton}
          </>
        )}
      </div>

      <VoiceNoteErrorMessage
        hasError={audioPlayer.hasError}
        id={errorDescriptionId}
      />

      <VoiceNoteTimeInfo
        currentTimeSeconds={audioPlayer.currentTimeSeconds}
        formatTime={audioPlayer.formatTime}
        isOwn={isOwn}
        totalDuration={audioPlayer.totalDurationSeconds}
      />
    </div>
  );
}
