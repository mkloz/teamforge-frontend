import { useRef, useState } from "react";

export function useRecordingTimer() {
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startTimer() {
    clearTimer();
    startTimeRef.current = Date.now();
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }

  function resetTimer() {
    clearTimer();
    setRecordingTime(0);
  }

  function getDurationSeconds() {
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }

  return {
    clearTimer,
    getDurationSeconds,
    recordingTime,
    resetTimer,
    startTimer,
  };
}
