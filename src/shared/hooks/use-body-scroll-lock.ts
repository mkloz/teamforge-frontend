import { useEffect } from "react";

import { getBrowserDocumentBody } from "@/shared/lib/browser-environment";

interface UseBodyScrollLockOptions {
  locked: boolean;
}

export function useBodyScrollLock({ locked }: UseBodyScrollLockOptions) {
  useEffect(() => {
    const body = getBrowserDocumentBody();

    if (!locked || !body) {
      return;
    }

    const previousBodyOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
    };
  }, [locked]);
}
