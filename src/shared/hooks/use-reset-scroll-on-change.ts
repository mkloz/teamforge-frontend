import { type RefObject, useLayoutEffect, useRef } from "react";
import { hasBrowserWindow } from "@/shared/lib/browser-environment";

interface UseResetScrollOnChangeOptions<TElement extends HTMLElement> {
  behavior?: ScrollBehavior;
  enabled?: boolean;
  onReset?: () => void;
  ref?: RefObject<TElement | null>;
  resetKey: unknown;
  skipInitial?: boolean;
}

export function useResetScrollOnChange<TElement extends HTMLElement>({
  behavior = "auto",
  enabled = true,
  onReset,
  ref,
  resetKey,
  skipInitial = true,
}: UseResetScrollOnChangeOptions<TElement>) {
  const previousResetKeyRef = useRef<unknown>(undefined);
  const hasSeenResetKeyRef = useRef(false);

  useLayoutEffect(() => {
    if (!hasSeenResetKeyRef.current) {
      hasSeenResetKeyRef.current = true;
      previousResetKeyRef.current = resetKey;

      if (skipInitial) {
        return;
      }
    } else if (Object.is(previousResetKeyRef.current, resetKey)) {
      return;
    }

    previousResetKeyRef.current = resetKey;

    if (!enabled || !hasBrowserWindow()) {
      return;
    }

    const scrollOptions: ScrollToOptions = {
      behavior,
      left: 0,
      top: 0,
    };

    if (ref?.current) {
      ref.current.scrollTo(scrollOptions);
    } else {
      window.scrollTo(scrollOptions);
    }

    onReset?.();
  }, [behavior, enabled, onReset, ref, resetKey, skipInitial]);
}
