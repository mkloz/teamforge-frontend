import type { useAudioPlayer } from "@/features/activity/hooks/use-audio-player";

export type VoiceNotePlayerState = ReturnType<typeof useAudioPlayer>;
export type WaveformBar = VoiceNotePlayerState["bars"][number];
