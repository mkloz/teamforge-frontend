import { useEffect } from "react";

import { addBrowserWindowEventListener } from "@/shared/lib/browser-environment";
import { captureException } from "@/shared/lib/telemetry";
import { telemetryErrorScopes } from "@/shared/lib/telemetry-contract";

function handleWindowError(event: ErrorEvent) {
  captureException(
    telemetryErrorScopes.windowError,
    event.error ?? new Error(event.message),
    {
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
    },
  );
}

function handleUnhandledRejection(event: PromiseRejectionEvent) {
  captureException(telemetryErrorScopes.windowUnhandledRejection, event.reason);
}

function registerWindowErrorTelemetry() {
  const removeWindowErrorListener = addBrowserWindowEventListener(
    "error",
    handleWindowError,
  );
  const removeUnhandledRejectionListener = addBrowserWindowEventListener(
    "unhandledrejection",
    handleUnhandledRejection,
  );

  return () => {
    removeUnhandledRejectionListener();
    removeWindowErrorListener();
  };
}

export function AppErrorListeners() {
  useEffect(registerWindowErrorTelemetry, []);

  return null;
}
