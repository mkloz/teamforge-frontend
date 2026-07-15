export function formatPlanDateSummary(planDate: string) {
  const date = new Date(`${planDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
