type RuntimeDiagnosticStatus = "error" | "idle" | "running" | "success";

export interface RuntimeDiagnosticEntry {
  errorMessage: string | null;
  reason: string | null;
  status: RuntimeDiagnosticStatus;
  updatedAt: number | null;
}

export interface PwaRuntimeDiagnosticsSnapshot {
  reconnectRefresh: RuntimeDiagnosticEntry;
  realtimeResync: RuntimeDiagnosticEntry;
}

type PwaRuntimeDiagnosticsListener = () => void;

const EMPTY_DIAGNOSTIC_ENTRY = {
  errorMessage: null,
  reason: null,
  status: "idle",
  updatedAt: null,
} as const satisfies RuntimeDiagnosticEntry;

let diagnosticsSnapshot: PwaRuntimeDiagnosticsSnapshot = {
  reconnectRefresh: EMPTY_DIAGNOSTIC_ENTRY,
  realtimeResync: EMPTY_DIAGNOSTIC_ENTRY,
};

const listeners = new Set<PwaRuntimeDiagnosticsListener>();

function emitDiagnosticsChange() {
  for (const listener of listeners) {
    listener();
  }
}

function setDiagnosticsSnapshot(
  updater: (
    snapshot: PwaRuntimeDiagnosticsSnapshot,
  ) => PwaRuntimeDiagnosticsSnapshot,
) {
  diagnosticsSnapshot = updater(diagnosticsSnapshot);
  emitDiagnosticsChange();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : "Unknown error";
}

export function recordPwaReconnectRefresh(
  status: Exclude<RuntimeDiagnosticStatus, "idle">,
  reason: string,
  error?: unknown,
) {
  setDiagnosticsSnapshot((snapshot) => ({
    ...snapshot,
    reconnectRefresh: {
      errorMessage: status === "error" ? getErrorMessage(error) : null,
      reason,
      status,
      updatedAt: Date.now(),
    },
  }));
}

export function recordPwaRealtimeResync(reason: string) {
  setDiagnosticsSnapshot((snapshot) => ({
    ...snapshot,
    realtimeResync: {
      errorMessage: null,
      reason,
      status: "success",
      updatedAt: Date.now(),
    },
  }));
}

export function subscribePwaRuntimeDiagnostics(
  listener: PwaRuntimeDiagnosticsListener,
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getPwaRuntimeDiagnosticsSnapshot() {
  return diagnosticsSnapshot;
}
