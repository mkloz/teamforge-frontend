import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

const BAR_COUNT = 38;

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function useAudioPlayer(url: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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
    setIsPlaying(true);
  });

  useEffect(() => {
    const audio = new Audio(url);
    audio.preload = "metadata";
    audioRef.current = audio;

    const syncAudioProgress = () => syncProgress(audio);

    audio.addEventListener("timeupdate", syncAudioProgress);
    audio.addEventListener("loadedmetadata", syncAudioProgress);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", syncAudioProgress);
      audio.removeEventListener("loadedmetadata", syncAudioProgress);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audioRef.current = null;
    };
  }, [url]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (progress >= 1) {
      audio.currentTime = 0;
      setProgress(0);
    }

    if (audio.paused) {
      void audio.play();
      return;
    }

    audio.pause();
  }

  function seek(newProgress: number) {
    const audio = audioRef.current;
    if (!audio) {
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

  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => {
        const mid = BAR_COUNT / 2;
        const distFromMid = Math.abs(i - mid);
        const envelope = Math.exp(
          -(distFromMid ** 2) / (2 * (BAR_COUNT / 4) ** 2),
        );
        const noise = 0.4 + Math.abs(Math.sin(i * 12.9898 + 78.233)) * 0.4;
        const height = (20 + envelope * 60) * noise;
        return {
          id: `voice-note-bar-${i}`,
          height: Math.min(Math.max(height, 15), 100),
        };
      }),
    [],
  );

  return {
    isPlaying,
    progress,
    playbackSpeed,
    bars,
    barCount: BAR_COUNT,
    durationSeconds,
    togglePlay,
    seek,
    toggleSpeed,
    formatTime,
  };
}
