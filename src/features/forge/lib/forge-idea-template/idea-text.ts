import type { ForgeIdeaLaunch } from "@/shared/navigation/forge-navigation";

import type { IdeaTemplateText } from "./types";

export function getIdeaTemplateText(idea: ForgeIdeaLaunch): IdeaTemplateText {
  const title = idea.title.trim() || "Interest-led small group";
  const detail = idea.detail.trim();

  return {
    detail,
    eventDescription: idea.eventDescription?.trim() || detail,
    title,
  };
}

export function getIdeaSearchText(idea: ForgeIdeaLaunch) {
  return `${idea.title} ${idea.detail} ${idea.eventDescription ?? ""}`;
}
