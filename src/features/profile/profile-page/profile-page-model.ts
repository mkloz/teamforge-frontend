import { buildProfileInsights } from "@/features/profile/lib/profile-insights";
import {
  getUserArchetype,
  getUserDimensionScores,
  getUserOceanScores,
} from "@/features/profile/lib/profile-utils";
import type { User } from "@/shared/schemas";

export function buildProfilePageModel(profile: User) {
  const oceanScores = getUserOceanScores(profile);
  const dimensionScores = getUserDimensionScores(profile);
  const archetype = getUserArchetype(profile);
  const profileInsights = buildProfileInsights(profile, oceanScores);

  return {
    archetype,
    dimensionScores,
    oceanScores,
    profileInsights,
    socialRead: getCompactSocialRead(profileInsights.portrait.lead),
  };
}

function getCompactSocialRead(value: string) {
  const [sentence] = value.match(/[^.!?]+[.!?]+/g) ?? [value];

  return sentence.trim();
}
