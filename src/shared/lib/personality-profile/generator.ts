import { buildBalancedProfile } from "@/shared/lib/personality-profile/balanced-profile";
import {
  getBestPair,
  getOtherSignal,
  getRankedSignals,
  getTertiarySignal,
} from "@/shared/lib/personality-profile/signal-utils";
import { buildSocialRead } from "@/shared/lib/personality-profile/social-read";
import { buildStrengths } from "@/shared/lib/personality-profile/strengths";
import { buildSummary } from "@/shared/lib/personality-profile/summary";
import { getProfileTitle } from "@/shared/lib/personality-profile/title";
import type { PersonalityProfile } from "@/shared/lib/personality-profile/types";
import type { OceanScores } from "@/shared/types/psychometrics";

export function generateDetailedDescription(
  scores: OceanScores,
): PersonalityProfile {
  const signals = getRankedSignals(scores);

  if (signals.length === 0) {
    return buildBalancedProfile();
  }

  const primary = signals[0];
  const selectedPair = getBestPair(primary, signals);
  const secondary = selectedPair
    ? getOtherSignal(selectedPair, primary)
    : signals[1];

  return {
    title: getProfileTitle(primary, selectedPair),
    summary: buildSummary(
      primary,
      secondary,
      getTertiarySignal(signals, [primary, secondary]),
    ),
    strengths: buildStrengths(signals),
    inGroups: buildSocialRead(primary, secondary, selectedPair),
  };
}
