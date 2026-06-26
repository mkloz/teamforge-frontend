import { useCallback, useEffect, useRef, useState } from "react";

type ServiceWorkerDiagnosticsStatus =
  | "active"
  | "checking"
  | "error"
  | "installing"
  | "not-registered"
  | "unsupported"
  | "waiting";

interface ServiceWorkerDiagnosticsSnapshot {
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

const UNSUPPORTED_SNAPSHOT: ServiceWorkerDiagnosticsSnapshot = {
  isControlled: false,
  scope: null,
  scriptUrl: null,
  status: "unsupported",
};

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

function getIsServiceWorkerControlled() {
  return Boolean(navigator.serviceWorker.controller);
}

function getNotRegisteredSnapshot(): ServiceWorkerDiagnosticsSnapshot {
  return {
    isControlled: getIsServiceWorkerControlled(),
    scope: null,
    scriptUrl: null,
    status: "not-registered",
  };
}

function getErrorSnapshot(): ServiceWorkerDiagnosticsSnapshot {
  return {
    isControlled: getIsServiceWorkerControlled(),
    scope: null,
    scriptUrl: null,
    status: "error",
  };
}

function getRegistrationStatus(
  registration: ServiceWorkerRegistration,
): ServiceWorkerDiagnosticsStatus {
  if (registration.waiting) {
    return "waiting";
  }

  if (registration.installing) {
    return "installing";
  }

  return registration.active ? "active" : "checking";
}

function toSnapshot(
  registration: ServiceWorkerRegistration | undefined,
): ServiceWorkerDiagnosticsSnapshot {
  if (!registration) {
    return getNotRegisteredSnapshot();
  }

  const worker = getRegistrationWorker(registration);

  return {
    isControlled: getIsServiceWorkerControlled(),
    scope: registration.scope,
    scriptUrl: worker?.scriptURL ?? null,
    status: getRegistrationStatus(registration),
  };
}

async function readServiceWorkerSnapshot() {
  if (!getIsServiceWorkerSupported()) {
    return UNSUPPORTED_SNAPSHOT;
  }

  const registration = await withDiagnosticsTimeout(
    navigator.serviceWorker.getRegistration(),
    undefined,
  );

  return toSnapshot(registration);
}

async function updateServiceWorkerRegistrationIfNeeded(
  checkForUpdate: boolean,
) {
  if (!checkForUpdate) {
    return;
  }

  const registration = await withDiagnosticsTimeout(
    navigator.serviceWorker.getRegistration(),
    undefined,
  );

  if (registration) {
    await withDiagnosticsTimeout(registration.update(), undefined);
  }
}

async function readUpdatedServiceWorkerSnapshot(checkForUpdate: boolean) {
  await updateServiceWorkerRegistrationIfNeeded(checkForUpdate);

  return readServiceWorkerSnapshot();
}

export function useServiceWorkerDiagnostics() {
  const [snapshot, setSnapshot] =
    useState<ServiceWorkerDiagnosticsSnapshot>(INITIAL_SNAPSHOT);
  const [isChecking, setIsChecking] = useState(false);
  const isMountedRef = useRef(true);

  const setCheckingIfMounted = useCallback((nextIsChecking: boolean) => {
    if (isMountedRef.current) {
      setIsChecking(nextIsChecking);
    }
  }, []);

  const commitSnapshot = useCallback(
    (nextSnapshot: ServiceWorkerDiagnosticsSnapshot) => {
      if (isMountedRef.current) {
        setSnapshot(nextSnapshot);
      }

      return nextSnapshot;
    },
    [],
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(
    async (checkForUpdate = false) => {
      if (!getIsServiceWorkerSupported()) {
        return commitSnapshot(UNSUPPORTED_SNAPSHOT);
      }

      setCheckingIfMounted(true);

      try {
        return commitSnapshot(
          await readUpdatedServiceWorkerSnapshot(checkForUpdate),
        );
      } catch {
        return commitSnapshot(getErrorSnapshot());
      } finally {
        setCheckingIfMounted(false);
      }
    },
    [commitSnapshot, setCheckingIfMounted],
  );

  useEffect(() => {
    let isActive = true;

    if (!getIsServiceWorkerSupported()) {
      commitSnapshot(UNSUPPORTED_SNAPSHOT);
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
  }, [commitSnapshot, refresh]);

  return {
    ...snapshot,
    checkForUpdate: () => refresh(true),
    isChecking,
    refresh: () => refresh(),
  };
}
