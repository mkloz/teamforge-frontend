import type { Interest, User } from "@/shared/schemas";
import type { OceanScores } from "../profile-contract";
import { buildActivityIdeas } from "./activity-ideas";
import { buildActivityLanes } from "./activity-lanes";
import { buildGroupFit } from "./group-fit";
import { buildMatchingSignals } from "./matching-signals";
import { buildProfilePortrait } from "./portrait";
import { buildSocialProfile } from "./social-profile";
import type { ProfileInsightModel } from "./types";
import { normalizeTaxonomyId, normalizeText } from "./utils";

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
  const interests = getInsightReadyInterests(user.interests ?? []);
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

function getInsightReadyInterests(interests: Interest[]) {
  const seen = new Set<string>();
  const readyInterests: Interest[] = [];

  for (const interest of interests) {
    if (!interest.isActive) {
      continue;
    }

    const key = getInterestDedupeKey(interest);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    readyInterests.push(interest);
  }

  return readyInterests;
}

function getInterestDedupeKey(interest: Interest) {
  return (
    getCanonicalTaxonomyKey(interest.slug) ||
    getCanonicalTaxonomyKey(interest.id) ||
    normalizeText([interest.name])
  );
}

function getCanonicalTaxonomyKey(value: string | null | undefined) {
  return normalizeTaxonomyId(value ?? "").at(-1) ?? "";
}
