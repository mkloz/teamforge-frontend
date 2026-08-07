export function getBrowserLocalStorageItem(key: string) {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch (error) {
    // Storage may be unavailable in private or policy-restricted contexts.
    void error;
    return null;
  }
}

export function setBrowserLocalStorageItem(key: string, value: string) {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch (error) {
    // Account-backed preferences still work when storage is blocked.
    void error;
  }
}
