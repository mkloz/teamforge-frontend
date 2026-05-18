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
      const scoreDelta =
        getSortableScore(right.score) - getSortableScore(left.score);

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      const confidenceDelta =
        getActivityIdeaConfidenceRank(right.confidence) -
        getActivityIdeaConfidenceRank(left.confidence);

      if (confidenceDelta !== 0) {
        return confidenceDelta;
      }

      return left.title.localeCompare(right.title);
    })
    .map(toActivityIdea);
}

function dedupeActivityIdeas(
  candidates: ActivityIdeaCandidate[],
): ActivityIdeaCandidate[] {
  const byTitle = new Map<string, ActivityIdeaCandidate>();

  for (const candidate of candidates) {
    const titleKey = normalizeIdeaTitleKey(candidate.title);
    const existing = byTitle.get(titleKey);

    if (
      !existing ||
      getSortableScore(candidate.score) > getSortableScore(existing.score)
    ) {
      byTitle.set(titleKey, candidate);
    }
  }

  return [...byTitle.values()];
}

function toActivityIdea(candidate: ActivityIdeaCandidate): ActivityIdea {
  return {
    confidence: candidate.confidence,
    detail: candidate.detail.trim(),
    eventDescription: candidate.eventDescription.trim(),
    laneKey: candidate.laneKey,
    secondaryLaneKey: candidate.secondaryLaneKey,
    title: candidate.title.trim(),
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

function normalizeIdeaTitleKey(title: string) {
  return title.trim().toLowerCase();
}

function getSortableScore(score: number) {
  return Number.isFinite(score) ? score : Number.NEGATIVE_INFINITY;
}
