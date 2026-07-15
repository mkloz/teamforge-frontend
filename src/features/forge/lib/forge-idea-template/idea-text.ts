import type { ForgeIdeaLaunch } from "@/shared/navigation/forge-navigation";

export function getIdeaSearchText(idea: ForgeIdeaLaunch) {
  return `${idea.title} ${idea.detail} ${idea.eventDescription ?? ""}`;
}
