import { useCallback, useEffect, useState } from "react";

export type ServiceWorkerDiagnosticsStatus =
  | "active"
  | "checking"
  | "error"
  | "installing"
  | "not-registered"
  | "unsupported"
  | "waiting";

export interface ServiceWorkerDiagnosticsSnapshot {
  isControlled: boolean;
  scope: string | null;
  scriptUrl: string | null;
  status: ServiceWorkerDiagnosticsStatus;
}

const INITIAL_SNAPSHOT: ServiceWorkerDiagnosticsSnapshot = {
  isControlled: false,
  scope: null,
  scriptUrl: null,
  status: "checking",
};

const SERVICE_WORKER_DIAGNOSTICS_TIMEOUT_MS = 8000;

function setSnapshotAndReturn(
  setSnapshot: (snapshot: ServiceWorkerDiagnosticsSnapshot) => void,
  snapshot: ServiceWorkerDiagnosticsSnapshot,
) {
  setSnapshot(snapshot);

  return snapshot;
}

function getIsServiceWorkerSupported() {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

async function withDiagnosticsTimeout<T>(promise: Promise<T>, fallback: T) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeoutId = setTimeout(
          () => resolve(fallback),
          SERVICE_WORKER_DIAGNOSTICS_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

function getRegistrationWorker(
  registration: ServiceWorkerRegistration,
): ServiceWorker | null {
  return registration.waiting ?? registration.installing ?? registration.active;
}

function toSnapshot(
  registration: ServiceWorkerRegistration | undefined,
): ServiceWorkerDiagnosticsSnapshot {
  if (!registration) {
    return {
      isControlled: Boolean(navigator.serviceWorker.controller),
      scope: null,
      scriptUrl: null,
      status: "not-registered",
    };
  }

  const worker = getRegistrationWorker(registration);
  const status = registration.waiting
    ? "waiting"
    : registration.installing
      ? "installing"
      : registration.active
        ? "active"
        : "checking";

  return {
    isControlled: Boolean(navigator.serviceWorker.controller),
    scope: registration.scope,
    scriptUrl: worker?.scriptURL ?? null,
    status,
  };
}

async function readServiceWorkerSnapshot() {
  if (!getIsServiceWorkerSupported()) {
    return {
      isControlled: false,
      scope: null,
      scriptUrl: null,
      status: "unsupported" as const,
    };
  }

  const registration = await withDiagnosticsTimeout(
    navigator.serviceWorker.getRegistration(),
    undefined,
  );

  return toSnapshot(registration);
}

export function useServiceWorkerDiagnostics() {
  const [snapshot, setSnapshot] =
    useState<ServiceWorkerDiagnosticsSnapshot>(INITIAL_SNAPSHOT);
  const [isChecking, setIsChecking] = useState(false);

  const refresh = useCallback(async (checkForUpdate = false) => {
    if (!getIsServiceWorkerSupported()) {
      return setSnapshotAndReturn(setSnapshot, {
        isControlled: false,
        scope: null,
        scriptUrl: null,
        status: "unsupported",
      });
    }

    setIsChecking(true);

    try {
      if (checkForUpdate) {
        const registration = await withDiagnosticsTimeout(
          navigator.serviceWorker.getRegistration(),
          undefined,
        );

        if (registration) {
          await withDiagnosticsTimeout(registration.update(), undefined);
        }
      }

      return setSnapshotAndReturn(
        setSnapshot,
        await readServiceWorkerSnapshot(),
      );
    } catch {
      return setSnapshotAndReturn(setSnapshot, {
        isControlled: Boolean(navigator.serviceWorker.controller),
        scope: null,
        scriptUrl: null,
        status: "error",
      });
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    if (!getIsServiceWorkerSupported()) {
      setSnapshot({
        isControlled: false,
        scope: null,
        scriptUrl: null,
        status: "unsupported",
      });
      return () => {
        isActive = false;
      };
    }

    async function syncSnapshot() {
      if (isActive) {
        await refresh();
      }
    }

    function handleFocus() {
      void syncSnapshot();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void syncSnapshot();
      }
    }

    function handleControllerChange() {
      void syncSnapshot();
    }

    void syncSnapshot();
    void navigator.serviceWorker.ready.then(syncSnapshot);

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      isActive = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, [refresh]);

  return {
    ...snapshot,
    checkForUpdate: () => refresh(true),
    isChecking,
    refresh: () => refresh(),
  };
}
