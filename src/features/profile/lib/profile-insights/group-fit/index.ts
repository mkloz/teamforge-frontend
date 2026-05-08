import { getCloseSecondCandidate } from "../social-profile";
import type {
  ActivityIdea,
  GroupFitInsight,
  SocialProfileModel,
} from "../types";
import {
  buildEmptyGroupFit,
  buildMissingActivityGroupFit,
} from "./group-fit-empty-states";
import {
  buildGroupFitAvoid,
  buildGroupFitBestWith,
  buildGroupFitOpeningMove,
  buildPortraitChemistry,
} from "./group-fit-recommendations";
import { getGroupFitStyle } from "./group-fit-style";
import {
  buildPortraitGroupSignals,
  buildPortraitGroupSummary,
} from "./group-fit-summary";

export function buildGroupFit(
  socialProfile: SocialProfileModel,
  activityIdeas: ActivityIdea[],
): GroupFitInsight {
  const { context, primaryKey } = socialProfile;
  const topLane = context.lanes[0] ?? null;
  const style = getGroupFitStyle(primaryKey);
  const closeSecond = getCloseSecondCandidate(socialProfile.candidates);
  const openingIdea = activityIdeas[0] ?? null;

  if (
    !context.traits &&
    !context.personality.type &&
    context.lanes.length === 0
  ) {
    return buildEmptyGroupFit();
  }

  if (context.lanes.length === 0) {
    return buildMissingActivityGroupFit();
  }

  return {
    avoid: buildGroupFitAvoid(primaryKey, socialProfile),
    bestWith: buildGroupFitBestWith(primaryKey, socialProfile, openingIdea),
    chemistry: buildPortraitChemistry(primaryKey, socialProfile),
    openingMove: buildGroupFitOpeningMove(openingIdea, topLane),
    signals: buildPortraitGroupSignals(
      primaryKey,
      socialProfile,
      topLane,
      openingIdea,
    ),
    summary: buildPortraitGroupSummary(primaryKey, socialProfile, closeSecond),
    title: style.title,
  };
}
