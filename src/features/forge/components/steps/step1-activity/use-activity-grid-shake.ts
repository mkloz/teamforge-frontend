import { useEffect, useEffectEvent, useRef, useState } from "react";

export function useActivityGridShake(shakeRequestId: number) {
  const [shaking, setShaking] = useState(false);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerShake = useEffectEvent(() => {
    setShaking(true);

    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }

    shakeTimeoutRef.current = setTimeout(() => {
      setShaking(false);
      shakeTimeoutRef.current = null;
    }, 500);
  });

  useEffect(() => {
    if (shakeRequestId > 0) {
      triggerShake();
    }
  }, [shakeRequestId]);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, []);

  return shaking;
}
