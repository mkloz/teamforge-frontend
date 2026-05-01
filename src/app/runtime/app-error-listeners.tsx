import { useEffect } from "react";

import { captureException } from "@/shared/lib/telemetry";
import { telemetryErrorScopes } from "@/shared/lib/telemetry-contract";

export function AppErrorListeners() {
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      captureException(
        telemetryErrorScopes.windowError,
        event.error ?? new Error(event.message),
        {
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
        },
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureException(
        telemetryErrorScopes.windowUnhandledRejection,
        event.reason,
      );
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return null;
}
