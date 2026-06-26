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
  accessBrowserSessionStorage(
    (storage) => {
      storage.setItem(key, value);
    },
    undefined,
    "Session storage write failed.",
  );
}
