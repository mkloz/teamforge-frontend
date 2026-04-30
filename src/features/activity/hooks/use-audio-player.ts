import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useAudioPlayer(url: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [durationSeconds, setDurationSeconds] = useState(0);

  useEffect(() => {
    const audio = new Audio(url);
    audio.preload = "metadata";
    audioRef.current = audio;

    const syncProgress = () => {
      const safeDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDurationSeconds(safeDuration);
      setProgress(safeDuration > 0 ? audio.currentTime / safeDuration : 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(1);
    };

    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener("timeupdate", syncProgress);
    audio.addEventListener("loadedmetadata", syncProgress);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", syncProgress);
      audio.removeEventListener("loadedmetadata", syncProgress);
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

  const togglePlay = useCallback(() => {
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
  }, [progress]);

  const seek = useCallback((newProgress: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const safeDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const nextProgress = Math.max(0, Math.min(1, newProgress));
    audio.currentTime = safeDuration * nextProgress;
    setProgress(nextProgress);
  }, []);

  const toggleSpeed = useCallback(() => {
    setPlaybackSpeed((previous) => {
      if (previous === 1) return 1.5;
      if (previous === 1.5) return 2;
      return 1;
    });
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const barCount = 38;
  const bars = useMemo(
    () =>
      Array.from({ length: barCount }, (_, i) => {
        const mid = barCount / 2;
        const distFromMid = Math.abs(i - mid);
        const envelope = Math.exp(
          -Math.pow(distFromMid, 2) / (2 * Math.pow(barCount / 4, 2)),
        );
        const noise = 0.4 + Math.abs(Math.sin(i * 12.9898 + 78.233)) * 0.4;
        const height = (20 + envelope * 60) * noise;
        return { height: Math.min(Math.max(height, 15), 100) };
      }),
    [barCount],
  );

  return {
    isPlaying,
    progress,
    playbackSpeed,
    bars,
    barCount,
    durationSeconds,
    togglePlay,
    seek,
    toggleSpeed,
    formatTime,
  };
}
