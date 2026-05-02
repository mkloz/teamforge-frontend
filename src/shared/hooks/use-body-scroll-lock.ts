import { useEffect } from "react";

interface UseBodyScrollLockOptions {
  locked: boolean;
}

export function useBodyScrollLock({ locked }: UseBodyScrollLockOptions) {
  useEffect(() => {
    if (!locked) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [locked]);
}
