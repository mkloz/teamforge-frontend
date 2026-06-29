import { lazy, Suspense, useEffect, useRef } from "react";
import {
  LANDING_BELOW_FOLD_REQUEST_EVENT,
  type LandingBelowFoldRequestDetail,
  scrollLandingElementToStart,
} from "@/shared/components/public-site/landing-scroll";
import {
  LANDING_SECTIONS,
  type LandingSectionId,
} from "@/shared/components/public-site/landing-sections";
import { useDeferredRender } from "@/shared/hooks/use-deferred-render";

const LazyLandingBelowFoldSections = lazy(() =>
  import("@/features/landing/landing-below-fold-sections").then((module) => ({
    default: module.LandingBelowFoldSections,
  })),
);

const MAX_DEFERRED_SCROLL_FRAMES = 45;
const ALIGNED_FRAME_COUNT = 6;
const MAX_ALIGNED_TARGET_TOP = 180;

function isLandingSectionId(id: string): id is LandingSectionId {
  return LANDING_SECTIONS.some((section) => section.id === id);
}

function getInitialScrollRequest() {
  if (typeof window === "undefined") {
    return null;
  }

  const targetId = window.location.hash.slice(1);

  if (!isLandingSectionId(targetId) || targetId === "hero") {
    return null;
  }

  return {
    options: {
      behavior: "auto",
      block: "start",
    },
    targetId,
  } as const satisfies LandingBelowFoldRequestDetail;
}

function isTargetAligned(target: HTMLElement) {
  const { top } = target.getBoundingClientRect();

  return top >= 0 && top <= MAX_ALIGNED_TARGET_TOP;
}

function startDeferredLandingScroll(request: LandingBelowFoldRequestDetail) {
  let frame = 0;
  let attempts = 0;
  let alignedFrames = 0;

  function retryScroll() {
    const target = document.getElementById(request.targetId);

    if (target) {
      scrollLandingElementToStart(target, request.options);

      if (isTargetAligned(target)) {
        alignedFrames += 1;
      } else {
        alignedFrames = 0;
      }
    }

    attempts += 1;

    if (
      alignedFrames < ALIGNED_FRAME_COUNT &&
      attempts < MAX_DEFERRED_SCROLL_FRAMES
    ) {
      frame = requestAnimationFrame(retryScroll);
    }
  }

  frame = requestAnimationFrame(retryScroll);

  return () => {
    cancelAnimationFrame(frame);
  };
}

export function DeferredLandingBelowFoldSections() {
  const initialScrollRequest = getInitialScrollRequest();
  const initialScrollRequestRef = useRef(initialScrollRequest);
  const cancelScrollRef = useRef<(() => void) | null>(null);
  const { sentinelRef, setShouldRender, shouldRender } = useDeferredRender({
    initialShouldRender: initialScrollRequest !== null,
  });

  useEffect(() => {
    const handleRequest = (
      event: CustomEvent<LandingBelowFoldRequestDetail>,
    ) => {
      const { detail } = event;

      if (!detail?.targetId) {
        return;
      }

      setShouldRender(true);
      cancelScrollRef.current?.();
      cancelScrollRef.current = startDeferredLandingScroll(detail);
    };

    window.addEventListener(LANDING_BELOW_FOLD_REQUEST_EVENT, handleRequest);

    return () => {
      window.removeEventListener(
        LANDING_BELOW_FOLD_REQUEST_EVENT,
        handleRequest,
      );
    };
  }, [setShouldRender]);

  useEffect(() => {
    const request = initialScrollRequestRef.current;

    if (!shouldRender || !request) {
      return undefined;
    }

    initialScrollRequestRef.current = null;
    cancelScrollRef.current?.();
    cancelScrollRef.current = startDeferredLandingScroll(request);

    return undefined;
  }, [shouldRender]);

  useEffect(
    () => () => {
      cancelScrollRef.current?.();
    },
    [],
  );

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />
      {shouldRender ? (
        <Suspense fallback={null}>
          <LazyLandingBelowFoldSections />
        </Suspense>
      ) : null}
    </>
  );
}
