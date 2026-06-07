import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  LANDING_SECTIONS,
  type LandingSectionId,
} from "@/features/landing/constants/landing-sections";
import {
  LANDING_BELOW_FOLD_REQUEST_EVENT,
  type LandingBelowFoldRequestDetail,
  scrollLandingElementToStart,
} from "@/features/landing/lib/landing-scroll";

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

export function DeferredLandingBelowFoldSections() {
  const initialScrollRequest = getInitialScrollRequest();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(
    initialScrollRequest !== null,
  );
  const [pendingScrollRequest, setPendingScrollRequest] =
    useState<LandingBelowFoldRequestDetail | null>(initialScrollRequest);

  useEffect(() => {
    const handleRequest = (
      event: CustomEvent<LandingBelowFoldRequestDetail>,
    ) => {
      const { detail } = event;

      if (!detail?.targetId) {
        return;
      }

      setPendingScrollRequest(detail);
      setShouldRender(true);
    };

    window.addEventListener(LANDING_BELOW_FOLD_REQUEST_EVENT, handleRequest);

    return () => {
      window.removeEventListener(
        LANDING_BELOW_FOLD_REQUEST_EVENT,
        handleRequest,
      );
    };
  }, []);

  useEffect(() => {
    if (shouldRender) {
      return undefined;
    }

    const sentinel = sentinelRef.current;

    if (!sentinel || typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "0px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender || !pendingScrollRequest) {
      return undefined;
    }

    const request = pendingScrollRequest;
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
        return;
      }

      setPendingScrollRequest(null);
    }

    frame = requestAnimationFrame(retryScroll);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [pendingScrollRequest, shouldRender]);

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
