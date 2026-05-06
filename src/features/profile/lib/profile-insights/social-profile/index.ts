import type { User } from "@/shared/schemas";
import type { OceanScores } from "../../profile-contract";
import type {
  ActivityLane,
  PortraitContext,
  SocialProfileModel,
} from "../types";
import { getFirstName } from "../utils";
import {
  getCloseSecondCandidate,
  getPortraitConfidence,
} from "./portrait-confidence";
import {
  buildPersonalityTensions,
  parsePersonalityType,
} from "./personality-profile";
import { resolvePortraitCandidates } from "./portrait-candidates";
import { buildTraitProfile } from "./trait-profile";

export { getCloseSecondCandidate } from "./portrait-confidence";

export function buildSocialProfile(
  user: User,
  oceanScores: OceanScores | null,
  lanes: ActivityLane[],
): SocialProfileModel {
  const traits = oceanScores ? buildTraitProfile(oceanScores) : null;
  const personality = parsePersonalityType(user.personalityType);
  const context: PortraitContext = {
    firstName: getFirstName(user.name),
    lanes,
    personality,
    tensions: buildPersonalityTensions(personality, traits),
    traits,
    user,
  };
  const candidates = resolvePortraitCandidates(context);
  const secondaryCandidate = getCloseSecondCandidate(candidates);
  const confidence = getPortraitConfidence(
    user,
    oceanScores,
    lanes,
    candidates,
  );

  return {
    candidates,
    confidence,
    context,
    primaryKey: candidates[0].key,
    secondaryCandidate,
  };
}
