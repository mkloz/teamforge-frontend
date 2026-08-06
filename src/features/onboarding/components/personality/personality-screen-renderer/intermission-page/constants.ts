import { Brain, type LucideIcon, Target } from "lucide-react";

import {
  TEST_LENGTH_CONFIG,
  type TestLength,
} from "@/features/onboarding/data/ipip-questions";

const INTERMISSION_CONTENT: {
  icon: LucideIcon;
  title: string;
  description: string;
  factTitle: string;
  fact: string;
}[] = [
  {
    icon: Brain,
    title: "Traits on a scale",
    description:
      "Your answers contribute to scores across several traits rather than one fixed category.",
    factTitle: "How to use the result",
    fact: "Use the result as a prompt for reflection, not as a final label.",
  },
  {
    icon: Target,
    title: "Why some questions are similar",
    description: "Some questions cover the same trait from different angles.",
    factTitle: "Repeated topics",
    fact: "Answer each question based on your usual behavior, even when it resembles an earlier one.",
  },
  {
    icon: Brain,
    title: "Five broad traits",
    description:
      "The assessment covers openness, conscientiousness, extraversion, agreeableness, and emotional stability.",
    factTitle: "Scores, not categories",
    fact: "Each trait is reported on a scale, so results can fall anywhere between the two ends.",
  },
  {
    icon: Target,
    title: "Middle scores count",
    description:
      "You do not need extreme answers for the assessment to calculate a result.",
    factTitle: "A middle extraversion score",
    fact: "A score near the middle can reflect different behavior across settings and groups.",
  },
  {
    icon: Brain,
    title: "Emotional sensitivity",
    description:
      "Questions about stress and emotion contribute to the emotional-sensitivity score.",
    factTitle: "No preferred end",
    fact: "The score describes a tendency. It is not a grade or a judgment of character.",
  },
  {
    icon: Target,
    title: "Harmony and directness",
    description:
      "Agreeableness questions cover cooperation, compromise, and directness.",
    factTitle: "Different approaches",
    fact: "Higher scores often favor harmony. Lower scores can reflect a more direct approach.",
  },
  {
    icon: Brain,
    title: "Planning and flexibility",
    description:
      "Conscientiousness questions cover planning, organization, and follow-through.",
    factTitle: "Structure varies",
    fact: "People differ in how much advance planning they prefer and how they respond when plans change.",
  },
  {
    icon: Target,
    title: "Openness covers several areas",
    description:
      "Openness questions cover creativity, ideas, emotion, taste, and interest in novelty.",
    factTitle: "Preferences can differ",
    fact: "A person can enjoy new ideas while still preferring familiar routines in daily life.",
  },
  {
    icon: Brain,
    title: "Social behavior varies by setting",
    description:
      "Extraversion questions estimate how you usually respond to social activity.",
    factTitle: "Context matters",
    fact: "You may answer differently for a large crowd and a familiar small group. Choose what is most typical overall.",
  },
  {
    icon: Target,
    title: "More answers add detail",
    description:
      "The longer assessment includes more questions for each trait.",
    factTitle: "You can stop or continue",
    fact: "Finish with the answers you have given or continue if you want to answer the remaining questions.",
  },
];

const INTERMISSION_UPGRADE_OPTIONS: TestLength[] = [30, 50];

export function getIntermissionContent(milestoneIndex: number) {
  if (milestoneIndex === 0) {
    return {
      icon: Target,
      title: "Your starting set is complete",
      description:
        "You answered 10 questions. Choose your interests now, or continue all 30 questions for a more detailed matching profile.",
      factTitle: "Nothing is lost",
      fact: "If you continue later in this session, these ten answers remain part of the full assessment.",
    };
  }

  const validIndex = Math.max(0, milestoneIndex - 1);

  return INTERMISSION_CONTENT[validIndex % INTERMISSION_CONTENT.length];
}

export function canExtendIntermission(
  totalQuestions: number,
  allowLengthChanges = true,
) {
  return allowLengthChanges && totalQuestions < 50;
}

export function getIntermissionActionLabel({
  isDone,
  selectedUpgrade,
}: {
  isDone: boolean;
  selectedUpgrade: TestLength | null;
}) {
  if (selectedUpgrade) {
    return `Continue with ${TEST_LENGTH_CONFIG[selectedUpgrade].label}`;
  }

  return isDone ? "Finish assessment" : "Continue assessment";
}

function getCurrentEstimatedMinutes(totalQuestions: number) {
  return (
    Object.values(TEST_LENGTH_CONFIG).find(
      (config) => config.itemsPerDimension * 5 === totalQuestions,
    )?.estimatedMinutes ?? 0
  );
}

export function getIntermissionUpgradeOptions(totalQuestions: number) {
  const currentEstimatedMinutes = getCurrentEstimatedMinutes(totalQuestions);

  return INTERMISSION_UPGRADE_OPTIONS.filter(
    (length) => length > totalQuestions,
  ).map((length) => {
    const config = TEST_LENGTH_CONFIG[length];

    return {
      config,
      estimatedMinutesToAdd: config.estimatedMinutes - currentEstimatedMinutes,
      length,
      questionsToAdd: config.itemsPerDimension * 5 - totalQuestions,
    };
  });
}
