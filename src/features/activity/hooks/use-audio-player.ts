import { useEffect, useEffectEvent, useRef, useState } from "react";

const BAR_COUNT = 38;
const AUDIO_BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const mid = BAR_COUNT / 2;
  const distFromMid = Math.abs(i - mid);
  const envelope = Math.exp(-(distFromMid ** 2) / (2 * (BAR_COUNT / 4) ** 2));
  const noise = 0.4 + Math.abs(Math.sin(i * 12.9898 + 78.233)) * 0.4;
  const height = (20 + envelope * 60) * noise;

  return {
    id: `voice-note-bar-${i}`,
    height: Math.min(Math.max(height, 15), 100),
  };
});

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function useAudioPlayer(url: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const disposeAudioRef = useRef<(() => void) | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [durationSeconds, setDurationSeconds] = useState(0);

  const syncProgress = useEffectEvent((audio: HTMLAudioElement) => {
    const safeDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
    setDurationSeconds(safeDuration);
    setProgress(safeDuration > 0 ? audio.currentTime / safeDuration : 0);
  });

  const handleEnded = useEffectEvent(() => {
    setIsPlaying(false);
    setProgress(1);
  });

  const handlePause = useEffectEvent(() => {
    setIsPlaying(false);
  });

  const handlePlay = useEffectEvent(() => {
    setHasError(false);
    setIsPlaying(true);
  });

  const handleError = useEffectEvent(() => {
    setHasError(true);
    setIsPlaying(false);
  });

  function createAudio() {
    disposeAudioRef.current?.();

    const audio = new Audio(url);
    audio.preload = "none";
    audio.playbackRate = playbackSpeed;
    audioRef.current = audio;

    const syncAudioProgress = () => syncProgress(audio);

    audio.addEventListener("timeupdate", syncAudioProgress);
    audio.addEventListener("loadedmetadata", syncAudioProgress);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    disposeAudioRef.current = () => {
      audio.pause();
      audio.removeEventListener("timeupdate", syncAudioProgress);
      audio.removeEventListener("loadedmetadata", syncAudioProgress);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.src = "";
    };

    return {
      audio,
    };
  }

  useEffect(() => {
    return () => {
      disposeAudioRef.current?.();
      disposeAudioRef.current = null;
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: url intentionally tears down the previous audio element.
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      setHasError(false);
      setProgress(0);
      setDurationSeconds(0);
      return;
    }

    disposeAudioRef.current?.();
    disposeAudioRef.current = null;
    audioRef.current = null;
    setHasError(false);
    setProgress(0);
    setDurationSeconds(0);
  }, [url]);

  function togglePlay() {
    const currentAudio = audioRef.current;
    const { audio } = currentAudio ? { audio: currentAudio } : createAudio();

    if (progress >= 1) {
      audio.currentTime = 0;
      setProgress(0);
    }

    if (audio.paused) {
      void audio.play().catch(() => {
        setHasError(true);
        setIsPlaying(false);
      });
      return;
    }

    audio.pause();
  }

  function seek(newProgress: number) {
    const audio = audioRef.current;
    if (!audio || hasError) {
      return;
    }

    const safeDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const nextProgress = Math.max(0, Math.min(1, newProgress));
    audio.currentTime = safeDuration * nextProgress;
    setProgress(nextProgress);
  }

  function toggleSpeed() {
    setPlaybackSpeed((previous) => {
      if (previous === 1) return 1.5;
      if (previous === 1.5) return 2;
      return 1;
    });
  }

  return {
    isPlaying,
    hasError,
    progress,
    playbackSpeed,
    bars: AUDIO_BARS,
    barCount: BAR_COUNT,
    durationSeconds,
    togglePlay,
    seek,
    toggleSpeed,
    formatTime,
  };
}
