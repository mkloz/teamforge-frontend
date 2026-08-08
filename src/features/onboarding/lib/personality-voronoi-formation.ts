import type {
  Dimension,
  IpipQuestion,
} from "@/features/onboarding/data/ipip-questions";
import {
  type DynamicAssessmentState,
  type DynamicResponseValue,
  getDynamicAssessmentPreview,
} from "@/features/onboarding/lib/dynamic-personality-engine";
import type { RawAnswers } from "@/features/onboarding/lib/personality-answer";
import type { VoronoiFormationTarget } from "@/shared/lib/voronoi/voronoi-contract";
import type { PublicPersonalityProfile } from "@/shared/schemas/public-personality-profile";

interface PersonalityVoronoiFormationInput {
  answers: RawAnswers;
  dynamicState: DynamicAssessmentState | null;
  pendingDynamicAnswers: Record<string, DynamicResponseValue>;
  questions: IpipQuestion[];
  result: PublicPersonalityProfile | null;
}

interface PersonalityAxisSignal {
  confidence: number;
  letter: string;
  resolved: boolean;
}

const PERSONALITY_AXES = [
  { dimension: "E", highLetter: "E", lowLetter: "I" },
  { dimension: "O", highLetter: "N", lowLetter: "S" },
  { dimension: "A", highLetter: "F", lowLetter: "T" },
  { dimension: "C", highLetter: "J", lowLetter: "P" },
] as const satisfies readonly {
  dimension: Dimension;
  highLetter: string;
  lowLetter: string;
}[];

const DEFAULT_PERSONALITY_FORMATION = {
  kind: "symbol",
  value: "group",
} as const satisfies VoronoiFormationTarget;

export function getPersonalityVoronoiFormation({
  answers,
  dynamicState,
  pendingDynamicAnswers,
  questions,
  result,
}: PersonalityVoronoiFormationInput): VoronoiFormationTarget {
  const signals = result
    ? getResultSignals(result)
    : dynamicState
      ? getDynamicSignals(dynamicState, pendingDynamicAnswers)
      : getFixedAssessmentSignals(questions, answers);

  if (!signals.some((signal) => signal.resolved)) {
    return DEFAULT_PERSONALITY_FORMATION;
  }

  const strongestSignal = signals.reduce(
    (strongest, signal, index) =>
      signal.resolved && signal.confidence > strongest.confidence
        ? { confidence: signal.confidence, index }
        : strongest,
    { confidence: 0, index: -1 },
  );

  return {
    kind: "text",
    value: signals
      .map((signal) => (signal.resolved ? signal.letter : "?"))
      .join(""),
    ...(strongestSignal.index >= 0
      ? {
          accentCharacterIndices: [strongestSignal.index],
          accentStrength: 0.42 + strongestSignal.confidence * 0.58,
        }
      : {}),
  };
}

function getFixedAssessmentSignals(
  questions: IpipQuestion[],
  answers: RawAnswers,
) {
  return PERSONALITY_AXES.map((axis) => {
    const answeredQuestions = questions.filter(
      (question) =>
        question.dimension === axis.dimension &&
        answers[question.id] !== undefined,
    );
    const count = answeredQuestions.length;

    if (count === 0) {
      return getUnresolvedSignal();
    }

    const score =
      answeredQuestions.reduce((sum, question) => {
        const value = answers[question.id] ?? 3;
        return sum + (question.keyed === "+" ? value : 6 - value);
      }, 0) / count;
    const direction = (score - 3) / 2;
    const coverageConfidence = Math.min(1, count / 3);

    return {
      confidence: Math.abs(direction) * (0.45 + coverageConfidence * 0.55),
      letter: direction > 0 ? axis.highLetter : axis.lowLetter,
      resolved: true,
    };
  });
}

function getDynamicSignals(
  state: DynamicAssessmentState,
  pendingAnswers: Record<string, DynamicResponseValue>,
) {
  const preview = getDynamicAssessmentPreview(state, pendingAnswers);

  return PERSONALITY_AXES.map((axis) => {
    const answeredCount = preview.answeredCounts[axis.dimension];
    if (answeredCount === 0) {
      return getUnresolvedSignal();
    }

    const estimate = preview.estimates[axis.dimension];
    const direction = (estimate.score - 50) / 50;
    const precisionConfidence = 1 - Math.min(1, estimate.posteriorSd / 1.25);

    return {
      confidence: Math.abs(direction) * (0.55 + precisionConfidence * 0.45),
      letter: direction > 0 ? axis.highLetter : axis.lowLetter,
      resolved: true,
    };
  });
}

function getResultSignals(result: PublicPersonalityProfile) {
  const scores: Record<(typeof PERSONALITY_AXES)[number]["dimension"], number> =
    {
      A: result.ocean.agreeableness,
      C: result.ocean.conscientiousness,
      E: result.ocean.extraversion,
      O: result.ocean.openness,
    };

  return PERSONALITY_AXES.map((axis, index) => ({
    confidence: Math.abs(scores[axis.dimension] - 50) / 50,
    letter: result.personalityType[index] ?? axis.lowLetter,
    resolved: true,
  }));
}

function getUnresolvedSignal(): PersonalityAxisSignal {
  return { confidence: 0, letter: "?", resolved: false };
}
