import { useState } from "react";

import { getDiagnosticItems } from "@/features/download/components/pwa-diagnostics-panel/diagnostic-view-model";
import { PwaDiagnosticsGrid } from "@/features/download/components/pwa-diagnostics-panel/diagnostics-grid";
import { PwaDiagnosticsHeader } from "@/features/download/components/pwa-diagnostics-panel/diagnostics-header";
import { refreshPwaDiagnostics } from "@/features/download/components/pwa-diagnostics-panel/diagnostics-refresh";
import { usePwaDisplayMode } from "@/shared/hooks/use-pwa-display-mode";
import { usePwaInstallPrompt } from "@/shared/hooks/use-pwa-install-prompt";
import { useServiceWorkerDiagnostics } from "@/shared/hooks/use-service-worker-diagnostics";
import { useWebPushSubscription } from "@/shared/hooks/use-web-push-subscription";
import { isBrowserSecureContext } from "@/shared/lib/browser-environment";

function getSecureContextSnapshot() {
  return isBrowserSecureContext();
}

export function PwaDiagnosticsPanel() {
  const { isStandalone } = usePwaDisplayMode();
  const { canPromptInstall } = usePwaInstallPrompt();
  const serviceWorker = useServiceWorkerDiagnostics();
  const push = useWebPushSubscription();
  const isSecureContext = getSecureContextSnapshot();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const diagnostics = getDiagnosticItems({
    canPromptInstall,
    isSecureContext,
    isStandalone,
    push,
    serviceWorker,
  });

  async function handleRefreshDiagnostics() {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);

    await refreshPwaDiagnostics({
      push,
      serviceWorker,
    });

    setIsRefreshing(false);
  }

  return (
    <section
      aria-labelledby="pwa-diagnostics-title"
      className="border-border/70 border-y bg-background"
    >
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <PwaDiagnosticsHeader
          isRefreshing={isRefreshing}
          onRefresh={() => {
            void handleRefreshDiagnostics();
          }}
        />

        <PwaDiagnosticsGrid diagnostics={diagnostics} />
      </div>
    </section>
  );
}
