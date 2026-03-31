import { useState, useEffect, useCallback, useMemo } from "react";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);

  // Playback logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 0.005 * playbackSpeed;
          if (next >= 1) {
            setIsPlaying(false);
            return 1;
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const togglePlay = useCallback(() => {
    setProgress((prev) => {
      if (prev >= 1) return 0;
      return prev;
    });
    setIsPlaying((prev) => !prev);
  }, []);

  const seek = useCallback((newProgress: number) => {
    setProgress(Math.max(0, Math.min(1, newProgress)));
  }, []);

  const toggleSpeed = useCallback(() => {
    setPlaybackSpeed((prev) => {
      if (prev === 1) return 1.5;
      if (prev === 1.5) return 2;
      return 1;
    });
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Waveform logic
  const barCount = 38;
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const mid = barCount / 2;
      const distFromMid = Math.abs(i - mid);
      const envelope = Math.exp(
        -Math.pow(distFromMid, 2) / (2 * Math.pow(barCount / 4, 2)),
      );
      // Deterministic noise for purity using sine hash
      const noise = 0.4 + Math.abs(Math.sin(i * 12.9898 + 78.233)) * 0.4;
      const height = (20 + envelope * 60) * noise;
      return { height: Math.min(Math.max(height, 15), 100) };
    });
  }, [barCount]);

  return {
    isPlaying,
    progress,
    playbackSpeed,
    bars,
    barCount,
    togglePlay,
    seek,
    toggleSpeed,
    formatTime,
  };
}
