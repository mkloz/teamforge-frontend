import { useCallback, useEffect, useRef, useState } from "react";

const PLAN_CREATION_CYCLE_MS = 1450;
const FIRST_IMPACT_MS = 725;
const FINAL_IMPACT_DELAY_MS = 220;
const MIN_VISIBLE_MS = 1100;
const COMPLETE_EXIT_HOLD_MS = 260;

export function usePlanCreationAnimation() {
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runIdRef = useRef(0);
  const requestSettledRef = useRef(false);
  const strikeCountRef = useRef(0);
  const startedAtRef = useRef(0);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [planCreationStrikeCount, setPlanCreationStrikeCount] = useState(0);

  const clearPlanCreationTimers = useCallback(() => {
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
      clearPlanCreationTimers();
    },
    [clearPlanCreationTimers],
  );

  function finishPlanCreation(runId: number) {
    strikeCountRef.current += 1;
    setPlanCreationStrikeCount(strikeCountRef.current);
    setCreationProgress(100);

    scheduleTimeout(() => {
      if (runIdRef.current !== runId) {
        return;
      }

      setIsCreatingPlan(false);
      clearPlanCreationTimers();
    }, COMPLETE_EXIT_HOLD_MS);
  }

  function schedulePlanCreationFinish(runId: number) {
    const elapsed = performance.now() - startedAtRef.current;
    const delay = Math.max(MIN_VISIBLE_MS - elapsed, FINAL_IMPACT_DELAY_MS);

    scheduleTimeout(() => {
      if (runIdRef.current !== runId) {
        return;
      }

      finishPlanCreation(runId);
    }, delay);
  }

  function scheduleNextImpact(runId: number, delay: number) {
    scheduleTimeout(() => {
      if (runIdRef.current !== runId) {
        return;
      }

      strikeCountRef.current += 1;
      setPlanCreationStrikeCount(strikeCountRef.current);
      setCreationProgress((progress) =>
        requestSettledRef.current ? progress : Math.min(progress + 22, 88),
      );

      if (requestSettledRef.current) {
        return;
      }

      scheduleNextImpact(runId, PLAN_CREATION_CYCLE_MS);
    }, delay);
  }

  function runPlanCreationAnimation(request: () => void | Promise<void>) {
    clearPlanCreationTimers();

    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    requestSettledRef.current = false;
    strikeCountRef.current = 0;
    startedAtRef.current = performance.now();

    setIsCreatingPlan(true);
    setCreationProgress(8);
    setPlanCreationStrikeCount(0);

    scheduleNextImpact(runId, FIRST_IMPACT_MS);

    void Promise.resolve()
      .then(request)
      .catch(() => undefined)
      .finally(() => {
        if (runIdRef.current !== runId) {
          return;
        }

        requestSettledRef.current = true;
        setCreationProgress((progress) => Math.max(progress, 92));
        schedulePlanCreationFinish(runId);
      });
  }

  return {
    planCreationStrikeCount,
    isCreatingPlan,
    creationProgress,
    runPlanCreationAnimation,
  };
}
