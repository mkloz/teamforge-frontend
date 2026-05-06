import type {
  ActivityIdea,
  ActivityIdeaCandidate,
  ActivityLaneConfidence,
} from "../types";

export function rankActivityIdeas(
  candidates: ActivityIdeaCandidate[],
): ActivityIdea[] {
  return dedupeActivityIdeas(candidates)
    .sort((left, right) => {
      const scoreDelta = right.score - left.score;

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return (
        getActivityIdeaConfidenceRank(right.confidence) -
        getActivityIdeaConfidenceRank(left.confidence)
      );
    })
    .map(toActivityIdea);
}

function dedupeActivityIdeas(
  candidates: ActivityIdeaCandidate[],
): ActivityIdeaCandidate[] {
  const byTitle = new Map<string, ActivityIdeaCandidate>();

  for (const candidate of candidates) {
    const existing = byTitle.get(candidate.title);

    if (!existing || candidate.score > existing.score) {
      byTitle.set(candidate.title, candidate);
    }
  }

  return [...byTitle.values()];
}

function toActivityIdea(candidate: ActivityIdeaCandidate): ActivityIdea {
  return {
    confidence: candidate.confidence,
    detail: candidate.detail,
    laneKey: candidate.laneKey,
    secondaryLaneKey: candidate.secondaryLaneKey,
    title: candidate.title,
  };
}

function getActivityIdeaConfidenceRank(confidence: ActivityLaneConfidence) {
  const ranks: Record<ActivityLaneConfidence, number> = {
    clear: 2,
    soft: 1,
    strong: 3,
  };

  return ranks[confidence];
}
