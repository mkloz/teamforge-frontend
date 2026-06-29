export function normalizeRouteSearch(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = new URLSearchParams(
    value.startsWith("?") ? value.slice(1) : value,
  ).toString();

  return normalized.length > 0 ? normalized : null;
}
