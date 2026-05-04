import { useEffect, useRef, useState } from "react";

const FORGE_CYCLE_MS = 1600;
const FIRST_IMPACT_MS = 800;
const IMPACT_EXIT_HOLD_MS = 120;

export function useForgeAnimation() {
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runIdRef = useRef(0);
  const requestSettledRef = useRef(false);
  const strikeCountRef = useRef(0);
  const [isForging, setIsForging] = useState(false);
  const [forgingProgress, setForgingProgress] = useState(0);
  const [forgeStrikeCount, setForgeStrikeCount] = useState(0);

  function clearForgeTimers() {
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current = [];
  }

  function scheduleTimeout(callback: () => void, delay: number) {
    const timeout = setTimeout(callback, delay);
    timeoutRefs.current.push(timeout);

    return timeout;
  }

  useEffect(
    () => () => {
      clearForgeTimers();
    },
    [],
  );

  function finishForgeOnImpact(runId: number) {
    scheduleTimeout(() => {
      if (runIdRef.current !== runId) {
        return;
      }

      setForgingProgress(100);
      setIsForging(false);
    }, IMPACT_EXIT_HOLD_MS);
  }

  function scheduleNextImpact(runId: number, delay: number) {
    scheduleTimeout(() => {
      if (runIdRef.current !== runId) {
        return;
      }

      strikeCountRef.current += 1;
      setForgeStrikeCount(strikeCountRef.current);
      setForgingProgress((progress) =>
        requestSettledRef.current ? 100 : Math.min(progress + 18, 90),
      );

      if (requestSettledRef.current && strikeCountRef.current >= 1) {
        finishForgeOnImpact(runId);
        return;
      }

      scheduleNextImpact(runId, FORGE_CYCLE_MS);
    }, delay);
  }

  function runForgeAnimation(request: () => void | Promise<void>) {
    clearForgeTimers();

    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    requestSettledRef.current = false;
    strikeCountRef.current = 0;

    setIsForging(true);
    setForgingProgress(0);
    setForgeStrikeCount(0);

    scheduleNextImpact(runId, FIRST_IMPACT_MS);

    void Promise.resolve()
      .then(request)
      .catch(() => undefined)
      .finally(() => {
        if (runIdRef.current !== runId) {
          return;
        }

        requestSettledRef.current = true;
        setForgingProgress((progress) => Math.max(progress, 85));
      });
  }

  return {
    forgeStrikeCount,
    isForging,
    forgingProgress,
    runForgeAnimation,
  };
}
