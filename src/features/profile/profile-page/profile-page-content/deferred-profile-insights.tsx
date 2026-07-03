import { type ComponentProps, lazy, Suspense } from "react";
import { ProfileDeferredInsightsFallback } from "@/features/profile/profile-page/profile-page-content/profile-deferred-insights-fallback";
import { useDeferredRender } from "@/shared/hooks/use-deferred-render";

const LazyProfileDeferredInsights = lazy(() =>
  import("@/features/profile/profile-page/profile-deferred-insights").then(
    (module) => ({
      default: module.ProfileDeferredInsights,
    }),
  ),
);

const PROFILE_DEFERRED_INSIGHTS_DELAY_MS = 12_000;

export function DeferredProfileInsights({
  dimensionScores,
  oceanScores,
  profileInsights,
}: ComponentProps<typeof LazyProfileDeferredInsights>) {
  const { sentinelRef, shouldRender } = useDeferredRender({
    delayMs: PROFILE_DEFERRED_INSIGHTS_DELAY_MS,
  });

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />
      {shouldRender ? (
        <Suspense fallback={<ProfileDeferredInsightsFallback />}>
          <LazyProfileDeferredInsights
            dimensionScores={dimensionScores}
            oceanScores={oceanScores}
            profileInsights={profileInsights}
          />
        </Suspense>
      ) : (
        <ProfileDeferredInsightsFallback />
      )}
    </>
  );
}
