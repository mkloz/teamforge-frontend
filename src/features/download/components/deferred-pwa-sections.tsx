import { lazy, Suspense } from "react";
import { useDeferredRender } from "@/shared/hooks/use-deferred-render";

const DeferredPushNotificationBand = lazy(() =>
  import("@/features/download/components/push-notification-band").then((m) => ({
    default: m.PushNotificationBand,
  })),
);

const DeferredPwaDiagnosticsPanel = lazy(() =>
  import("@/features/download/components/pwa-diagnostics-panel").then((m) => ({
    default: m.PwaDiagnosticsPanel,
  })),
);

export function DeferredPwaSections() {
  const { sentinelRef, shouldRender } = useDeferredRender({
    rootMargin: "240px 0px",
  });

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />

      {shouldRender && (
        <Suspense fallback={null}>
          <DeferredPushNotificationBand />
          <DeferredPwaDiagnosticsPanel />
        </Suspense>
      )}
    </>
  );
}
