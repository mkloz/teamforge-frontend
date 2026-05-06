import type { ProfilePortraitInsight, SocialProfileModel } from "../types";
import { buildPortraitDetails } from "./portrait-details";
import { buildPortraitLead } from "./portrait-lead";
import {
  buildPortraitConfidenceNote,
  buildPortraitNote,
} from "./portrait-note";
import { buildPortraitTitle } from "./portrait-title";

export { describeLaneForPortrait } from "./lane-portrait-language";
export { buildPortraitTitle } from "./portrait-title";

export function buildProfilePortrait(
  socialProfile: SocialProfileModel,
): ProfilePortraitInsight {
  const { candidates, confidence, context, primaryKey, secondaryCandidate } =
    socialProfile;

  return {
    candidates,
    confidence,
    confidenceNote: buildPortraitConfidenceNote(socialProfile),
    details: buildPortraitDetails(primaryKey, context),
    lead: buildPortraitLead(primaryKey, context, secondaryCandidate),
    mode: secondaryCandidate ? "hybrid" : "focused",
    note: buildPortraitNote(context, candidates),
    secondaryCandidate,
    title: buildPortraitTitle(primaryKey, context),
  };
}
