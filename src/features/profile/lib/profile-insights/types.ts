import type { Interest, User } from "@/shared/schemas";
import type { OceanScores, OceanTraitKey } from "../profile-contract";

export type LaneKey =
  | "creative"
  | "outdoors"
  | "play"
  | "builder"
  | "food"
  | "learning"
  | "social"
  | "wellness"
  | "general";

export interface LaneRule {
  contextPatterns: RegExp[];
  key: LaneKey;
  ownPatterns: RegExp[];
  taxonomyIds: string[];
}

export interface ActivityLaneDraft {
  description: string;
  key: LaneKey;
  label: string;
  score: number;
}

export interface ActivityLane {
  confidence: ActivityLaneConfidence;
  description: string;
  evidence: ActivityLaneEvidence[];
  interests: Interest[];
  key: LaneKey;
  label: string;
  primaryEvidenceCount: number;
  score: number;
  supportingEvidenceCount: number;
}

export interface ActivityLaneEvidence {
  interest: Interest;
  reason: LaneEvidenceReason;
  role: "primary" | "supporting";
  score: number;
}

export interface ActivityIdea {
  confidence: ActivityLaneConfidence;
  detail: string;
  eventDescription: string;
  laneKey: LaneKey;
  secondaryLaneKey: LaneKey | null;
  title: string;
}

export interface GroupFitInsight {
  avoid: string;
  bestWith: string;
  chemistry: string;
  openingMove: string;
  signals: string[];
  summary: string;
  title: string;
  userSignal: UserGroupSignal;
}

export interface UserGroupSignal {
  connectionStyle: UserGroupSignalItem;
  groupEnergy: UserGroupSignalItem;
  socialRhythm: UserGroupSignalItem;
}

export interface UserGroupSignalItem {
  description: string;
  value: string;
}

export interface ProfilePortraitInsight {
  candidates: ProfilePortraitCandidate[];
  confidence: "early" | "medium" | "high";
  confidenceNote: string;
  details: Array<{
    label: string;
    value: string;
  }>;
  lead: string;
  mode: "focused" | "hybrid";
  note: string;
  secondaryCandidate: ProfilePortraitCandidate | null;
  title: string;
}

export interface ProfilePortraitCandidate {
  key: PortraitKey;
  score: number;
  share: number;
  title: string;
}

export interface MatchingSignal {
  detail: string;
  label: string;
  strength: MatchingSignalStrength;
  value: string;
}

export interface ProfileInsightModel {
  activityIdeas: ActivityIdea[];
  activityLanes: ActivityLane[];
  groupFit: GroupFitInsight;
  matchingSignals: MatchingSignal[];
  portrait: ProfilePortraitInsight;
}

export interface TraitProfile {
  dominant: {
    key: OceanTraitKey;
    label: string;
    value: number;
  };
  high: Set<OceanTraitKey>;
  low: Set<OceanTraitKey>;
  moderateHigh: Set<OceanTraitKey>;
  moderateLow: Set<OceanTraitKey>;
  scores: OceanScores;
}

export interface PersonalityProfile {
  attention: "practical" | "possibility" | "unknown";
  decision: "logic" | "people" | "unknown";
  energy: "outward" | "inward" | "unknown";
  structure: "planned" | "open" | "unknown";
  type: string | null;
}

export type PortraitKey =
  | "activeCatalyst"
  | "cafeConnector"
  | "calmAnchor"
  | "creativeInstigator"
  | "curiousSpecialist"
  | "restlessInstigator"
  | "ideaFirstExplorer"
  | "quietSpecialist"
  | "steadyHost"
  | "warmConnector"
  | "focusedBuilder"
  | "playfulScout"
  | "practicalOrganizer"
  | "socialGameHost"
  | "tasteMaker"
  | "flexibleParticipant";

export interface PortraitCandidate {
  key: PortraitKey;
  score: number;
}

export interface PersonalityTension {
  label: string;
  value: string;
}

export interface PortraitContext {
  firstName: string;
  lanes: ActivityLane[];
  personality: PersonalityProfile;
  tensions: PersonalityTension[];
  traits: TraitProfile | null;
  user: User;
}

export interface LaneMatch {
  key: LaneKey;
  rawScore: number;
  reason: LaneEvidenceReason;
  role: ActivityLaneEvidence["role"];
  score: number;
}

export interface LaneRuleMatch {
  key: LaneKey;
  rawScore: number;
  reason: LaneEvidenceReason;
}

export type LaneEvidenceReason =
  | "category"
  | "context"
  | "direct"
  | "fallback"
  | "mixed";

export type ActivityLaneConfidence = "clear" | "soft" | "strong";
export type MatchingSignalStrength = "good" | "quiet" | "ready";

export interface LaneBucket {
  evidence: ActivityLaneEvidence[];
  score: number;
}

export interface ActivityIdeaCandidate extends ActivityIdea {
  score: number;
}

export interface ActivityIdeaContext {
  anchors: string[];
  personality: PersonalityProfile;
  primaryLane: ActivityLane;
  secondaryLane: ActivityLane | null;
  socialPressure: "easy" | "lively" | "moderate";
  structure: "flexible" | "framed" | "open";
  traits: TraitProfile | null;
}

export interface SocialProfileModel {
  candidates: ProfilePortraitCandidate[];
  confidence: ProfilePortraitInsight["confidence"];
  context: PortraitContext;
  primaryKey: PortraitKey;
  secondaryCandidate: ProfilePortraitCandidate | null;
}
