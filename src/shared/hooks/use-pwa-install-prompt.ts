import { useEffect, useState } from "react";

import {
  hasPwaInstallPrompt,
  type PwaInstallPromptResult,
  promptPwaInstall,
  subscribePwaInstallPrompt,
} from "@/shared/lib/pwa-install-prompt";
import {
  type PwaTelemetrySource,
  trackPwaInstallPromptOutcome,
} from "@/shared/lib/pwa-telemetry";

function trackInstallPromptResult(
  source: PwaTelemetrySource,
  result: PwaInstallPromptResult,
) {
  if (result.outcome === "unavailable") {
    trackPwaInstallPromptOutcome({
      outcome: "unavailable",
      source,
    });
    return;
  }

  trackPwaInstallPromptOutcome({
    outcome: result.outcome,
    platform: result.platform,
    source,
  });
}

export function usePwaInstallPrompt(source: PwaTelemetrySource = "unknown") {
  const [canPromptInstall, setCanPromptInstall] = useState(hasPwaInstallPrompt);

  useEffect(() => {
    return subscribePwaInstallPrompt(() => {
      setCanPromptInstall(hasPwaInstallPrompt());
    });
  }, []);

  return {
    canPromptInstall,
    promptInstall: async () => {
      const result = await promptPwaInstall();
      trackInstallPromptResult(source, result);

      return result;
    },
  };
}
