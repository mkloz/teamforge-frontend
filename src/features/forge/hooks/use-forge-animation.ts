import { useCallback, useEffect, useRef, useState } from "react";

const FORGE_CYCLE_MS = 1450;
const FIRST_IMPACT_MS = 725;
const FINAL_IMPACT_DELAY_MS = 220;
const MIN_VISIBLE_MS = 1100;
const COMPLETE_EXIT_HOLD_MS = 260;

export function useForgeAnimation() {
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runIdRef = useRef(0);
  const requestSettledRef = useRef(false);
  const strikeCountRef = useRef(0);
  const startedAtRef = useRef(0);
  const [isForging, setIsForging] = useState(false);
  const [forgingProgress, setForgingProgress] = useState(0);
  const [forgeStrikeCount, setForgeStrikeCount] = useState(0);

  const clearForgeTimers = useCallback(() => {
    timeoutRefs.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    timeoutRefs.current = [];
  }, []);

  function scheduleTimeout(callback: () => void, delay: number) {
    const timeout = setTimeout(callback, delay);
    timeoutRefs.current.push(timeout);

    return timeout;
  }

  useEffect(
    () => () => {
      clearForgeTimers();
    },
    [clearForgeTimers],
  );

  function finishForge(runId: number) {
    strikeCountRef.current += 1;
    setForgeStrikeCount(strikeCountRef.current);
    setForgingProgress(100);

    scheduleTimeout(() => {
      if (runIdRef.current !== runId) {
        return;
      }

      setIsForging(false);
      clearForgeTimers();
    }, COMPLETE_EXIT_HOLD_MS);
  }

  function scheduleForgeFinish(runId: number) {
    const elapsed = performance.now() - startedAtRef.current;
    const delay = Math.max(MIN_VISIBLE_MS - elapsed, FINAL_IMPACT_DELAY_MS);

    scheduleTimeout(() => {
      if (runIdRef.current !== runId) {
        return;
      }

      finishForge(runId);
    }, delay);
  }

  function scheduleNextImpact(runId: number, delay: number) {
    scheduleTimeout(() => {
      if (runIdRef.current !== runId) {
        return;
      }

      strikeCountRef.current += 1;
      setForgeStrikeCount(strikeCountRef.current);
      setForgingProgress((progress) =>
        requestSettledRef.current ? progress : Math.min(progress + 22, 88),
      );

      if (requestSettledRef.current) {
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
    startedAtRef.current = performance.now();

    setIsForging(true);
    setForgingProgress(8);
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
        setForgingProgress((progress) => Math.max(progress, 92));
        scheduleForgeFinish(runId);
      });
  }

  return {
    forgeStrikeCount,
    isForging,
    forgingProgress,
    runForgeAnimation,
  };
}
