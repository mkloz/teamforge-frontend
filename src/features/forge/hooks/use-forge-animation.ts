import { useEffect, useRef, useState } from "react";

const MIN_FORGE_DURATION_MS = 6000;

export function useForgeAnimation() {
  const frameRef = useRef<number | null>(null);
  const [isForging, setIsForging] = useState(false);
  const [forgingProgress, setForgingProgress] = useState(0);

  function cancelForgeFrame() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    },
    [],
  );

  function runForgeAnimation(onComplete: () => void | Promise<void>) {
    cancelForgeFrame();
    setIsForging(true);
    setForgingProgress(0);

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / MIN_FORGE_DURATION_MS, 1);

      setForgingProgress(progress * 100);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      frameRef.current = null;
      setIsForging(false);
      void onComplete();
    };

    frameRef.current = requestAnimationFrame(tick);
  }

  return {
    isForging,
    forgingProgress,
    runForgeAnimation,
  };
}
