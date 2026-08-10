import type { PlanIdeaLaunch } from "@/shared/navigation/plan-creation-navigation";

export function getIdeaSearchText(idea: PlanIdeaLaunch) {
  return `${idea.title} ${idea.detail} ${idea.eventDescription ?? ""}`;
}
