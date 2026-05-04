export function formatShortSessionTime(value: string | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
