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

function getFinitePositiveDuration(value: number | undefined) {
  return value !== undefined && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function clampSeconds(seconds: number, duration: number) {
  return Math.max(0, Math.min(duration, seconds));
}

function tryResetAudioCurrentTime(audio: HTMLAudioElement) {
  try {
    audio.currentTime = 0;
    return true;
  } catch {
    return false;
  }
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function useAudioPlayer(url: string, attachmentDuration?: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const disposeAudioRef = useRef<(() => void) | null>(null);
  const pendingSeekRatioRef = useRef<number | null>(null);
  const metadataRequestStartedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isLoadingPlayback, setIsLoadingPlayback] = useState(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const fallbackDuration = getFinitePositiveDuration(attachmentDuration);
  const knownDuration = getFinitePositiveDuration(durationSeconds);
  const totalDurationSeconds = knownDuration ?? fallbackDuration;
  const progress = totalDurationSeconds
    ? clampSeconds(currentTimeSeconds, totalDurationSeconds) /
      totalDurationSeconds
    : 0;

  const syncAudioTime = useEffectEvent((audio: HTMLAudioElement) => {
    const nextDuration = getFinitePositiveDuration(audio.duration);
    if (nextDuration) {
      setDurationSeconds(nextDuration);
      setCurrentTimeSeconds(clampSeconds(audio.currentTime, nextDuration));
      return;
    }

    setCurrentTimeSeconds(Math.max(0, audio.currentTime));
  });

  const handleLoadedMetadata = useEffectEvent((audio: HTMLAudioElement) => {
    const nextDuration = getFinitePositiveDuration(audio.duration);
    metadataRequestStartedRef.current = false;
    setIsLoadingMetadata(false);

    if (!nextDuration) {
      syncAudioTime(audio);
      return;
    }

    setDurationSeconds(nextDuration);
    const pendingSeekRatio = pendingSeekRatioRef.current;
    if (pendingSeekRatio === null) {
      setCurrentTimeSeconds(clampSeconds(audio.currentTime, nextDuration));
      return;
    }

    const nextTime = clampSeconds(
      pendingSeekRatio * nextDuration,
      nextDuration,
    );
    pendingSeekRatioRef.current = null;
    audio.currentTime = nextTime;
    setCurrentTimeSeconds(nextTime);
  });

  const handleEnded = useEffectEvent((audio: HTMLAudioElement) => {
    setIsPlaying(false);
    setIsLoadingPlayback(false);
    const nextDuration =
      getFinitePositiveDuration(audio.duration) ?? fallbackDuration;
    if (nextDuration) {
      setCurrentTimeSeconds(nextDuration);
    }
  });

  const handlePause = useEffectEvent(() => {
    setIsPlaying(false);
    setIsLoadingPlayback(false);
  });

  const handlePlay = useEffectEvent(() => {
    setHasError(false);
    setIsLoadingPlayback(false);
    setIsPlaying(true);
  });

  const handlePlaybackFailure = useEffectEvent((audio: HTMLAudioElement) => {
    if (audioRef.current !== audio) {
      return;
    }

    pendingSeekRatioRef.current = null;
    metadataRequestStartedRef.current = false;
    setHasError(true);
    setIsPlaying(false);
    setIsLoadingMetadata(false);
    setIsLoadingPlayback(false);
    setCurrentTimeSeconds(0);
    tryResetAudioCurrentTime(audio);
  });

  function createAudio() {
    disposeAudioRef.current?.();

    const audio = new Audio();
    audio.preload = "none";
    audio.playbackRate = playbackSpeed;
    audioRef.current = audio;

    const syncCurrentAudioTime = () => syncAudioTime(audio);
    const loadCurrentAudioMetadata = () => handleLoadedMetadata(audio);
    const endCurrentAudio = () => handleEnded(audio);
    const pauseWhenDocumentHides = () => {
      if (document.visibilityState === "hidden") {
        audio.pause();
      }
    };

    audio.addEventListener("timeupdate", syncCurrentAudioTime);
    audio.addEventListener("loadedmetadata", loadCurrentAudioMetadata);
    audio.addEventListener("ended", endCurrentAudio);
    const failCurrentAudio = () => handlePlaybackFailure(audio);

    audio.addEventListener("error", failCurrentAudio);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    document.addEventListener("visibilitychange", pauseWhenDocumentHides);

    disposeAudioRef.current = () => {
      audio.pause();
      audio.removeEventListener("timeupdate", syncCurrentAudioTime);
      audio.removeEventListener("loadedmetadata", loadCurrentAudioMetadata);
      audio.removeEventListener("ended", endCurrentAudio);
      audio.removeEventListener("error", failCurrentAudio);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      document.removeEventListener("visibilitychange", pauseWhenDocumentHides);
      audio.src = "";
    };

    audio.src = url;

    return audio;
  }

  function requestMetadata(audio: HTMLAudioElement) {
    if (metadataRequestStartedRef.current) {
      return;
    }

    metadataRequestStartedRef.current = true;
    setIsLoadingMetadata(true);
    audio.preload = "metadata";
    audio.load();
  }

  useEffect(() => {
    return () => {
      pendingSeekRatioRef.current = null;
      metadataRequestStartedRef.current = false;
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
    if (audioRef.current) {
      disposeAudioRef.current?.();
      disposeAudioRef.current = null;
      audioRef.current = null;
    }

    pendingSeekRatioRef.current = null;
    metadataRequestStartedRef.current = false;
    setHasError(false);
    setIsPlaying(false);
    setIsLoadingMetadata(false);
    setIsLoadingPlayback(false);
    setCurrentTimeSeconds(0);
    setDurationSeconds(0);
  }, [url]);

  function togglePlay() {
    if (metadataRequestStartedRef.current) {
      return;
    }

    let audio = audioRef.current;
    if (hasError && audio) {
      disposeAudioRef.current?.();
      disposeAudioRef.current = null;
      audioRef.current = null;
      audio = null;
    }

    setHasError(false);
    const currentAudio = audio ?? createAudio();
    const currentDuration =
      getFinitePositiveDuration(currentAudio.duration) ?? fallbackDuration;

    if (currentDuration && currentTimeSeconds >= currentDuration) {
      pendingSeekRatioRef.current = null;
      currentAudio.currentTime = 0;
      setCurrentTimeSeconds(0);
    }

    if (currentAudio.paused) {
      setIsLoadingPlayback(true);
      void currentAudio.play().catch(() => {
        handlePlaybackFailure(currentAudio);
      });
      return;
    }

    currentAudio.pause();
  }

  function seek(nextSeconds: number) {
    const seekDuration = totalDurationSeconds;
    if (!seekDuration || !Number.isFinite(nextSeconds) || hasError) {
      return;
    }

    const optimisticTime = clampSeconds(nextSeconds, seekDuration);
    setCurrentTimeSeconds(optimisticTime);

    const audio = audioRef.current ?? createAudio();
    const metadataDuration = getFinitePositiveDuration(audio.duration);
    if (metadataDuration) {
      const reconciledTime = clampSeconds(optimisticTime, metadataDuration);
      pendingSeekRatioRef.current = null;
      audio.currentTime = reconciledTime;
      setCurrentTimeSeconds(reconciledTime);
      return;
    }

    pendingSeekRatioRef.current = optimisticTime / seekDuration;
    requestMetadata(audio);
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
    isLoading: isLoadingMetadata || isLoadingPlayback,
    isLoadingMetadata,
    isLoadingPlayback,
    progress,
    currentTimeSeconds,
    playbackSpeed,
    bars: AUDIO_BARS,
    barCount: BAR_COUNT,
    durationSeconds,
    totalDurationSeconds,
    togglePlay,
    seek,
    toggleSpeed,
    formatTime,
  };
}
