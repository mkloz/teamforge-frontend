import type { Interest } from "@/shared/schemas";
import type { LaneEvidenceReason, LaneMatch, LaneRuleMatch } from "../types";
import { normalizeTaxonomyId, normalizeText } from "../utils";
import { lanePriority } from "./lane-config";
import { laneRules } from "./lane-rules";
import {
  CONTEXT_LANE_MATCH_SCORE,
  DIRECT_LANE_MATCH_SCORE,
  SUPPORTING_LANE_MIN_SCORE,
  SUPPORTING_LANE_RATIO,
  SUPPORTING_LANE_SCORE_MULTIPLIER,
  TAXONOMY_LANE_MATCH_SCORE,
} from "./lane-scoring";

export function getLaneMatches(interest: Interest): LaneMatch[] {
  const textContext = buildInterestTextContext(interest);
  const taxonomyIds = getInterestTaxonomyIds(interest);

  const matches = laneRules.map((rule): LaneRuleMatch => {
    let score = 0;
    const reasons = new Set<LaneEvidenceReason>();

    if (rule.ownPatterns.some((pattern) => pattern.test(textContext.ownText))) {
      score += DIRECT_LANE_MATCH_SCORE;
      reasons.add("direct");
    }

    if (rule.taxonomyIds.some((id) => taxonomyIds.has(id))) {
      score += TAXONOMY_LANE_MATCH_SCORE;
      reasons.add("category");
    }

    if (
      rule.contextPatterns.some((pattern) =>
        pattern.test(textContext.contextText),
      )
    ) {
      score += CONTEXT_LANE_MATCH_SCORE;
      reasons.add("context");
    }

    return {
      key: rule.key,
      rawScore: score,
      reason: getLaneEvidenceReason(reasons),
    };
  });

  const rankedMatches = rankLaneRuleMatches(matches);
  const [best] = rankedMatches;

  if (best.rawScore <= 0) {
    return [
      {
        key: "general",
        rawScore: 1,
        reason: "fallback",
        role: "primary",
        score: 1,
      },
    ];
  }

  return rankedMatches
    .filter((match) => {
      if (match.key === best.key) {
        return true;
      }

      return isUsefulSupportingLane(match, best);
    })
    .slice(0, 3)
    .map((match) => ({
      key: match.key,
      rawScore: match.rawScore,
      reason: match.reason,
      role: match.key === best.key ? "primary" : "supporting",
      score:
        match.key === best.key
          ? match.rawScore
          : match.rawScore * SUPPORTING_LANE_SCORE_MULTIPLIER,
    }));
}

function buildInterestTextContext(interest: Interest) {
  return {
    contextText: normalizeText([
      interest.parent?.name,
      interest.parent?.slug,
      interest.parent?.id,
      interest.parentId,
      interest.description,
    ]),
    ownText: normalizeText([
      interest.name,
      interest.slug,
      interest.icon,
      ...(interest.aliases ?? []),
    ]),
  };
}

function getInterestTaxonomyIds(interest: Interest) {
  return new Set(
    [
      interest.id,
      interest.slug,
      interest.parent?.id,
      interest.parent?.slug,
      interest.parentId,
    ]
      .filter((value): value is string => Boolean(value))
      .flatMap((value) => normalizeTaxonomyId(value)),
  );
}

function rankLaneRuleMatches(matches: LaneRuleMatch[]) {
  return matches.sort((left, right) => {
    const scoreDelta = right.rawScore - left.rawScore;

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return lanePriority.indexOf(left.key) - lanePriority.indexOf(right.key);
  });
}

function isUsefulSupportingLane(match: LaneRuleMatch, best: LaneRuleMatch) {
  if (match.reason === "context") {
    return false;
  }

  return (
    match.rawScore >= SUPPORTING_LANE_MIN_SCORE &&
    match.rawScore / best.rawScore >= SUPPORTING_LANE_RATIO
  );
}

function getLaneEvidenceReason(reasons: Set<LaneEvidenceReason>) {
  if (reasons.size > 1) {
    return "mixed";
  }

  return [...reasons][0] ?? "fallback";
}
