import type {
  ActivityLane,
  ActivityLaneEvidence,
} from "@/features/profile/lib/profile-insights";

export function describeLaneEvidence(lane: ActivityLane) {
  const primary = lane.primaryEvidenceCount;
  const supporting = lane.supportingEvidenceCount;

  if (supporting === 0) {
    return `${primary} core cue${primary === 1 ? "" : "s"}`;
  }

  return `${primary} core + ${supporting} support`;
}

export function getEvidenceTitle(evidence: ActivityLaneEvidence) {
  const reasonLabels: Record<ActivityLaneEvidence["reason"], string> = {
    category: "Based on the interest category.",
    context: "Based on the broader interest context.",
    direct: "Based on the interest name.",
    fallback: "Used as a general interest cue.",
    mixed: "Based on several profile details.",
  };

  return reasonLabels[evidence.reason];
}
