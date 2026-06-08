import { useEffect } from "react";

import { isApiNetworkError } from "@/shared/api/api-network-error";
import { addBrowserWindowEventListener } from "@/shared/lib/browser-environment";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import { telemetryErrorScopes } from "@/shared/lib/telemetry-contract";

type ErrorTelemetryContext = Record<string, number | string | undefined>;

async function captureWindowException(
  scope: string,
  error: unknown,
  context: ErrorTelemetryContext = {},
) {
  try {
    const { captureException } = await import("@/shared/lib/telemetry");

    captureException(scope, error, context);
  } catch (telemetryError) {
    warnInDevelopment("Client error telemetry failed.", telemetryError);
  }
}

function handleWindowError(event: ErrorEvent) {
  void captureWindowException(
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
  if (isApiNetworkError(event.reason)) {
    event.preventDefault();
    return;
  }

  void captureWindowException(
    telemetryErrorScopes.windowUnhandledRejection,
    event.reason,
  );
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
