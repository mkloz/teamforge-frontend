export function normalizeBaseUrl(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    url.hash = "";
    url.search = "";

    return url.toString().replace(/\/$/u, "");
  } catch {
    return null;
  }
}
