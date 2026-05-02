export function getSystemMessageConfig(content: string) {
  const normalized = content.toLowerCase();

  if (
    normalized.includes("ready") ||
    normalized.includes("formed") ||
    normalized.includes("confirmed")
  ) {
    return { type: "positive" as const };
  }

  if (
    normalized.includes("joined") ||
    normalized.includes("left") ||
    normalized.includes("invited") ||
    normalized.includes("removed")
  ) {
    return { type: "user-event" as const };
  }

  if (normalized.includes("disbanded") || normalized.includes("declined")) {
    return { type: "info" as const };
  }

  return { type: "info" as const };
}
