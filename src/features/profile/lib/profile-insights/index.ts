import type { User } from "@/shared/schemas";
import type { OceanScores } from "../profile-contract";
import { buildActivityIdeas } from "./activity-ideas";
import { buildActivityLanes } from "./activity-lanes";
import { buildGroupFit } from "./group-fit";
import { buildMatchingSignals } from "./matching-signals";
import { buildProfilePortrait } from "./portrait";
import { buildSocialProfile } from "./social-profile";
import type { ProfileInsightModel } from "./types";

export type {
  ActivityIdea,
  ActivityLane,
  ActivityLaneEvidence,
  GroupFitInsight,
  MatchingSignal,
  PortraitKey,
  ProfileInsightModel,
  ProfilePortraitCandidate,
  ProfilePortraitInsight,
  UserGroupSignal,
} from "./types";

export function buildProfileInsights(
  user: User,
  oceanScores: OceanScores | null,
): ProfileInsightModel {
  const interests = user.interests ?? [];
  const activityLanes = buildActivityLanes(interests);
  const socialProfile = buildSocialProfile(user, oceanScores, activityLanes);
  const activityIdeas = buildActivityIdeas(activityLanes, socialProfile);

  return {
    activityIdeas,
    activityLanes,
    groupFit: buildGroupFit(socialProfile, activityIdeas),
    matchingSignals: buildMatchingSignals(socialProfile),
    portrait: buildProfilePortrait(socialProfile),
  };
}
