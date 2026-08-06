import { getBrowserWindow } from "@/shared/lib/browser-environment/window";
import { warnInDevelopment } from "@/shared/lib/development-warning";

function accessBrowserSessionStorage<T>(
  operation: (storage: Storage) => T,
  fallback: T,
  warningMessage?: string,
) {
  const browserWindow = getBrowserWindow();

  if (!browserWindow) {
    return fallback;
  }

  try {
    return operation(browserWindow.sessionStorage);
  } catch (error) {
    if (warningMessage) {
      warnInDevelopment(warningMessage, error);
    }

    return fallback;
  }
}

export function getBrowserSessionStorageItem(key: string) {
  return accessBrowserSessionStorage((storage) => storage.getItem(key), null);
}

export function setBrowserSessionStorageItem(key: string, value: string) {
  return accessBrowserSessionStorage(
    (storage) => {
      storage.setItem(key, value);
      return storage.getItem(key) === value;
    },
    false,
    "Session storage write failed.",
  );
}

export function removeBrowserSessionStorageItem(key: string) {
  return accessBrowserSessionStorage(
    (storage) => {
      storage.removeItem(key);
      return storage.getItem(key) === null;
    },
    false,
    "Session storage removal failed.",
  );
}

export function canUseBrowserSessionStorage() {
  const probeKey = "teamforge:session-storage-probe";
  const probeValue = crypto.randomUUID();
  const written = setBrowserSessionStorageItem(probeKey, probeValue);

  if (written) {
    removeBrowserSessionStorageItem(probeKey);
  }

  return written;
}
