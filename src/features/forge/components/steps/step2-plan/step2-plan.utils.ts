export function formatPlanDateSummary(planDate: string) {
  return new Date(`${planDate}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
