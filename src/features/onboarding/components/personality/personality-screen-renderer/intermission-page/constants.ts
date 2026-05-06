import { Brain, Target, type LucideIcon } from "lucide-react";

import {
  TEST_LENGTH_CONFIG,
  type TestLength,
} from "@/features/onboarding/data/ipip-questions";

export const INTERMISSION_CONTENT: {
  icon: LucideIcon;
  title: string;
  description: string;
  factTitle: string;
  fact: string;
}[] = [
  {
    icon: Brain,
    title: "Patterns, not boxes",
    description:
      "Your answers are forming a shape across several traits, not locking you into one type.",
    factTitle: "Why it feels familiar",
    fact: "A good result usually sounds like something you half-knew already. The value is seeing it clearly enough to use it.",
  },
  {
    icon: Target,
    title: "Similar questions have a job",
    description:
      "Some items may feel close to each other. That is part of how the read checks for consistency.",
    factTitle: "Why repeat at all?",
    fact: "Asking about the same tendency in a few ways helps smooth out mood, context, and the one answer you might overthink.",
  },
  {
    icon: Brain,
    title: "The Big Five lens",
    description:
      "The read looks at five broad traits that show up in everyday choices and social energy.",
    factTitle: "Why this model",
    fact: "Big Five is useful because it measures degrees. Most people are not all one thing; they sit somewhere along a few useful scales.",
  },
  {
    icon: Target,
    title: "Somewhere in the middle counts",
    description: "You do not need extreme answers to get a meaningful result.",
    factTitle: "Ambiverts are normal",
    fact: "Many people land between introverted and extroverted. The middle can still say a lot about when you open up and when you pull back.",
  },
  {
    icon: Brain,
    title: "Sensitivity is information",
    description:
      "Emotional sensitivity is not treated as good or bad. It is part of how you notice pressure.",
    factTitle: "Stability vs sensitivity",
    fact: "Some people stay steady under noise. Others catch small shifts early. Both patterns can be useful in the right setting.",
  },
  {
    icon: Target,
    title: "Harmony and honesty",
    description:
      "Agreeableness is about how you handle tension, compromise, and directness.",
    factTitle: "Not always nicer",
    fact: "High agreement can make groups feel easy. Lower agreement can help people say the thing everyone is avoiding.",
  },
  {
    icon: Brain,
    title: "Plans and flexibility",
    description:
      "Conscientiousness can show whether structure helps you feel free or boxed in.",
    factTitle: "Different kinds of reliable",
    fact: "Some people are reliable because they plan. Others are reliable because they adapt quickly when the plan changes.",
  },
  {
    icon: Target,
    title: "Curiosity has textures",
    description:
      "Openness is not only creativity. It can show up as taste, ideas, emotion, or appetite for novelty.",
    factTitle: "More than imagination",
    fact: "Someone can love new ideas and still prefer familiar routines. The details are what make the result feel personal.",
  },
  {
    icon: Brain,
    title: "Social energy is situational",
    description:
      "The read is looking for where your energy tends to rise, not whether you are always outgoing.",
    factTitle: "Context matters",
    fact: "A person can be quiet in a crowd and lively in the right small group. The test tries to catch that difference.",
  },
  {
    icon: Target,
    title: "Almost there",
    description:
      "The last stretch gives the result more texture, especially around traits that are close together.",
    factTitle: "Why finish",
    fact: "A few more answers can turn a vague result into one that feels easier to recognize.",
  },
];

export const INTERMISSION_UPGRADE_OPTIONS: TestLength[] = [30, 50, 150];

export function getIntermissionContent(milestoneIndex: number) {
  const validIndex = Math.max(0, milestoneIndex - 1);

  return INTERMISSION_CONTENT[validIndex % INTERMISSION_CONTENT.length];
}

export function canExtendIntermission(totalQuestions: number) {
  return totalQuestions < 150;
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

export function getCurrentEstimatedMinutes(totalQuestions: number) {
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
