import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  LANDING_BELOW_FOLD_REQUEST_EVENT,
  type LandingBelowFoldRequestDetail,
} from "@/features/landing/lib/landing-scroll";

const LazyLandingBelowFoldSections = lazy(() =>
  import("@/features/landing/landing-below-fold-sections").then((module) => ({
    default: module.LandingBelowFoldSections,
  })),
);

export function DeferredLandingBelowFoldSections() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [pendingScrollRequest, setPendingScrollRequest] =
    useState<LandingBelowFoldRequestDetail | null>(null);

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

    function retryScroll() {
      const target = document.getElementById(request.targetId);

      if (target) {
        target.scrollIntoView(request.options);
        setPendingScrollRequest(null);
        return;
      }

      attempts += 1;

      if (attempts < 120) {
        frame = requestAnimationFrame(retryScroll);
      }
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
