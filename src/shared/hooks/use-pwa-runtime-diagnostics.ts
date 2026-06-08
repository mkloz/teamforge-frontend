import { useSyncExternalStore } from "react";

import {
  getPwaRuntimeDiagnosticsSnapshot,
  subscribePwaRuntimeDiagnostics,
} from "@/shared/lib/pwa-runtime-diagnostics";

export function usePwaRuntimeDiagnostics() {
  return useSyncExternalStore(
    subscribePwaRuntimeDiagnostics,
    getPwaRuntimeDiagnosticsSnapshot,
    getPwaRuntimeDiagnosticsSnapshot,
  );
}
