import type { ActivityIdea, ActivityLane, SocialProfileModel } from "../types";
import {
  buildActivityIdeaContext,
  getActivitySocialPressure,
  getActivityStructure,
} from "./activity-idea-context";
import { rankActivityIdeas } from "./activity-idea-ranking";
import {
  buildPrimaryLaneActivityIdea,
  buildSecondaryActivityIdeas,
} from "./lane-activity-ideas";
import { buildSpecificActivityIdeas } from "./specific-activity-ideas";

export { getActivitySocialPressure, getActivityStructure };

export function buildActivityIdeas(
  lanes: ActivityLane[],
  socialProfile: SocialProfileModel,
): ActivityIdea[] {
  const primaryLane = lanes[0];

  if (!primaryLane) {
    return [
      {
        confidence: "soft",
        detail:
          "Useful as a neutral first step while the profile gathers stronger interests.",
        eventDescription:
          "Start with one broad shared-interest prompt and keep the first meetup small, public, and easy to adjust. Ask the group to choose one concrete activity, one simple meeting point, and one fallback option before the plan is confirmed.",
        laneKey: "general",
        secondaryLaneKey: null,
        title: "Interest-led small group",
      },
    ];
  }

  const context = buildActivityIdeaContext(primaryLane, lanes, socialProfile);
  const candidates = [
    ...buildSpecificActivityIdeas(context),
    buildPrimaryLaneActivityIdea(context),
    ...buildSecondaryActivityIdeas(context),
  ];

  return rankActivityIdeas(candidates).slice(0, 4);
}
