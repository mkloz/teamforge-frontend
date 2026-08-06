export function compactOperatorSearchParams(input: Record<string, unknown>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string" || typeof value === "number") {
      searchParams.set(key, String(value));
    }
  }

  return searchParams;
}
