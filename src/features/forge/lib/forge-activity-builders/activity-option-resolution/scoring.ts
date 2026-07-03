import {
  ACTIVITIES,
  type ActivityOption,
} from "@/features/forge/constants/forge.constants";
import { getFuzzyMatchScore, normalizeSearchText } from "@/shared/lib/fuzzy";
import {
  DESCRIPTION_FUZZY_DISABLED_IDS,
  DESCRIPTION_MATCH_WEIGHT,
  MIN_ACTIVITY_MATCH_MARGIN,
  MIN_ACTIVITY_MATCH_SCORE,
  MIN_TOKEN_EVIDENCE_SCORE,
  SUPPORTING_TOKEN_BONUS,
  UNMATCHED_TOKEN_PENALTY,
} from "./constants";
import { ACTIVITY_SEMANTIC_TERMS } from "./semantic-terms";
import { getActivitySearchTokens } from "./text";
import type { ActivityScore, ActivityScoreRanking } from "./types";

export function findFuzzyActivityOption(selectedActivity: string) {
  const normalizedQuery = normalizeSearchText(selectedActivity);
  const queryTokens = getActivitySearchTokens(selectedActivity);

  if (!normalizedQuery || queryTokens.length === 0) {
    return null;
  }

  const ranking = getFuzzyActivityScoreRanking(normalizedQuery, queryTokens);

  return getConfidentActivityOption(ranking);
}

function getFuzzyActivityScoreRanking(
  normalizedQuery: string,
  queryTokens: string[],
): ActivityScoreRanking {
  let ranking: ActivityScoreRanking = {
    bestScore: null,
    runnerUpScore: null,
  };

  for (const option of ACTIVITIES) {
    const score = scoreActivityOption(option, normalizedQuery, queryTokens);

    if (score <= 0) {
      continue;
    }

    ranking = getUpdatedActivityScoreRanking(ranking, { option, score });
  }

  return ranking;
}

function getUpdatedActivityScoreRanking(
  ranking: ActivityScoreRanking,
  score: ActivityScore,
): ActivityScoreRanking {
  if (!ranking.bestScore || score.score > ranking.bestScore.score) {
    return {
      bestScore: score,
      runnerUpScore: ranking.bestScore,
    };
  }

  if (!ranking.runnerUpScore || score.score > ranking.runnerUpScore.score) {
    return {
      ...ranking,
      runnerUpScore: score,
    };
  }

  return ranking;
}

function getConfidentActivityOption({
  bestScore,
  runnerUpScore,
}: ActivityScoreRanking) {
  if (!bestScore || bestScore.score < MIN_ACTIVITY_MATCH_SCORE) {
    return null;
  }

  if (
    runnerUpScore &&
    bestScore.score - runnerUpScore.score < MIN_ACTIVITY_MATCH_MARGIN
  ) {
    return null;
  }

  return bestScore.option;
}

function scoreActivityOption(
  option: ActivityOption,
  normalizedQuery: string,
  queryTokens: string[],
) {
  const canonicalScore = scoreCanonicalActivityOption(
    option,
    normalizedQuery,
    queryTokens,
  );
  const descriptionScore = scoreDescriptionActivityOption(
    option,
    normalizedQuery,
    queryTokens,
  );
  const semanticScore = scoreSemanticActivityOption(
    option,
    normalizedQuery,
    queryTokens,
  );

  return Math.max(canonicalScore, descriptionScore, semanticScore);
}

function scoreCanonicalActivityOption(
  option: ActivityOption,
  normalizedQuery: string,
  queryTokens: string[],
) {
  return Math.max(
    getFuzzyMatchScore(option.id, normalizedQuery),
    getFuzzyMatchScore(option.label, normalizedQuery),
    scoreTokenCoverage(
      getActivitySearchTokens(`${option.id} ${option.label}`),
      queryTokens,
    ),
  );
}

function scoreDescriptionActivityOption(
  option: ActivityOption,
  normalizedQuery: string,
  queryTokens: string[],
) {
  if (DESCRIPTION_FUZZY_DISABLED_IDS.has(option.id)) {
    return 0;
  }

  return (
    Math.max(
      getFuzzyMatchScore(option.description, normalizedQuery),
      scoreTokenCoverage(
        getActivitySearchTokens(option.description),
        queryTokens,
      ),
    ) * DESCRIPTION_MATCH_WEIGHT
  );
}

function scoreSemanticActivityOption(
  option: ActivityOption,
  normalizedQuery: string,
  queryTokens: string[],
) {
  const terms = ACTIVITY_SEMANTIC_TERMS[option.id];

  if (!terms || terms.length === 0) {
    return 0;
  }

  const normalizedTerms = terms.join(" ");

  return Math.max(
    getFuzzyMatchScore(normalizedTerms, normalizedQuery),
    scoreTokenCoverage(getActivitySearchTokens(normalizedTerms), queryTokens),
  );
}

function scoreTokenCoverage(targetTokens: string[], queryTokens: string[]) {
  if (targetTokens.length === 0 || queryTokens.length === 0) {
    return 0;
  }

  let matchedTokenCount = 0;
  let matchedTokenScoreTotal = 0;

  for (const queryToken of queryTokens) {
    const score = getBestTokenScore(targetTokens, queryToken);

    if (score < MIN_TOKEN_EVIDENCE_SCORE) {
      continue;
    }

    matchedTokenCount += 1;
    matchedTokenScoreTotal += score;
  }

  if (matchedTokenCount === 0) {
    return 0;
  }

  const averageMatchedScore = matchedTokenScoreTotal / matchedTokenCount;
  const supportingTokenBonus =
    Math.max(0, matchedTokenCount - 1) * SUPPORTING_TOKEN_BONUS;
  const unmatchedTokenPenalty =
    Math.max(0, queryTokens.length - matchedTokenCount) *
    UNMATCHED_TOKEN_PENALTY;

  return averageMatchedScore + supportingTokenBonus - unmatchedTokenPenalty;
}

function getBestTokenScore(targetTokens: string[], queryToken: string) {
  let bestScore = 0;

  for (const targetToken of targetTokens) {
    bestScore = Math.max(
      bestScore,
      getFuzzyMatchScore(targetToken, queryToken),
    );
  }

  return bestScore;
}
