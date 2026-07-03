import {
  type MutableRefObject,
  type RefObject,
  useLayoutEffect,
  useRef,
} from "react";
import {
  hasBrowserWindow,
  scrollBrowserTo,
} from "@/shared/lib/browser-environment";

interface UseResetScrollOnChangeOptions<TElement extends HTMLElement> {
  behavior?: ScrollBehavior;
  enabled?: boolean;
  onReset?: () => void;
  ref?: RefObject<TElement | null>;
  resetKey: unknown;
  skipInitial?: boolean;
}

interface ResetKeyTracker {
  hasSeenResetKeyRef: MutableRefObject<boolean>;
  previousResetKeyRef: MutableRefObject<unknown>;
}

function shouldResetForKey({
  hasSeenResetKeyRef,
  previousResetKeyRef,
  resetKey,
  skipInitial,
}: ResetKeyTracker &
  Pick<
    UseResetScrollOnChangeOptions<HTMLElement>,
    "resetKey" | "skipInitial"
  >) {
  if (!hasSeenResetKeyRef.current) {
    hasSeenResetKeyRef.current = true;
    previousResetKeyRef.current = resetKey;

    return !skipInitial;
  }

  if (Object.is(previousResetKeyRef.current, resetKey)) {
    return false;
  }

  previousResetKeyRef.current = resetKey;

  return true;
}

function getScrollOptions(behavior: ScrollBehavior): ScrollToOptions {
  return {
    behavior,
    left: 0,
    top: 0,
  };
}

function resetScrollPosition<TElement extends HTMLElement>({
  behavior,
  ref,
}: Pick<UseResetScrollOnChangeOptions<TElement>, "behavior" | "ref">) {
  const scrollOptions = getScrollOptions(behavior ?? "auto");

  if (ref?.current) {
    ref.current.scrollTo(scrollOptions);
    return;
  }

  scrollBrowserTo(scrollOptions);
}

function shouldRunScrollReset({
  enabled,
  shouldReset,
}: {
  enabled: boolean;
  shouldReset: boolean;
}) {
  return shouldReset && enabled && hasBrowserWindow();
}

function notifyScrollReset(
  onReset: UseResetScrollOnChangeOptions<HTMLElement>["onReset"],
) {
  onReset?.();
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
    const shouldReset = shouldResetForKey({
      hasSeenResetKeyRef,
      previousResetKeyRef,
      resetKey,
      skipInitial,
    });

    if (!shouldRunScrollReset({ enabled, shouldReset })) {
      return;
    }

    resetScrollPosition({ behavior, ref });
    notifyScrollReset(onReset);
  }, [behavior, enabled, onReset, ref, resetKey, skipInitial]);
}
