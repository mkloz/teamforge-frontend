import type { User } from "@/shared/schemas";
import {
  getExploreGroupDistanceLabel,
  getExploreGroupMatchScore,
  isExploreGroupFull,
} from "@/shared/lib/explore-group-presenters";
import {
  getUserOceanScores,
  normalizeTrustScore,
} from "@/shared/lib/user-psychometrics";
import type { OceanScores } from "@/shared/types/psychometrics";

export interface ExploreIdentity {
  mbti: string;
  trustScore: number;
  oceanScores: OceanScores;
}

export function getExploreIdentity(user?: User | null): ExploreIdentity | null {
  if (!user?.personalityType) {
    return null;
  }

  const oceanScores = getUserOceanScores(user);

  if (!oceanScores) {
    return null;
  }

  return {
    mbti: user.personalityType,
    trustScore: normalizeTrustScore(user.trustScore),
    oceanScores,
  };
}

export {
  getExploreGroupDistanceLabel,
  getExploreGroupMatchScore,
  isExploreGroupFull,
};
