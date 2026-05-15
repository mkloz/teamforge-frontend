import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { useInvalidateCurrentUser } from "@/shared/api/current-user-query";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";

import { OnboardingCache } from "../api/onboarding-cache";
import { OnboardingCommands } from "../api/onboarding-commands";
import { buildQuestionList, type TestLength } from "../data/ipip-questions";
import {
  toOptionalOnboardingSearch,
  useOnboardingFlowState,
} from "../lib/onboarding-flow-state";
import {
  buildBackToLabel,
  getOnboardingReturnDestinationLabel,
} from "../lib/onboarding-navigation-labels";
import { getOceanScoresFromVector } from "../lib/personality-results";
import { QUESTIONS_PER_PAGE } from "../lib/personality-test-page-constants";
import {
  buildPersonalityNextSearch,
  buildPersonalityPreviousSearch,
  resolvePersonalityExitNavigation,
} from "../lib/personality-test-page-flow";
import { usePersonalityTest } from "./use-personality-test";

export function usePersonalityTestPageFlow() {
  const [pendingLength, setPendingLength] = useState<TestLength | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isEditMode, returnTo, returnSearch, returnSection } =
    useOnboardingFlowState();
  const queryClient = useQueryClient();
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const { mutateAsync: persistPersonality } = useMutation({
    meta: {
      errorToastMessage: "We couldn't save your personality result right now.",
    },
    mutationFn: (
      payload: Parameters<typeof OnboardingCommands.updatePersonality>[0],
    ) => OnboardingCommands.updatePersonality(payload),
    onSuccess: async (updatedUser) => {
      OnboardingCache.setCurrentUser(queryClient, updatedUser);
      await invalidateCurrentUser();
    },
  });
  const testState = usePersonalityTest({
    questionsPerPage: QUESTIONS_PER_PAGE,
  });

  async function continueToInterests() {
    if (testState.result && testState.vector) {
      const oceanScores = getOceanScoresFromVector(testState.vector);

      await persistPersonality({
        personalityType: testState.result.type,
        oceanO: oceanScores.openness,
        oceanC: oceanScores.conscientiousness,
        oceanE: oceanScores.extraversion,
        oceanA: oceanScores.agreeableness,
        oceanN: oceanScores.neuroticism,
      });
    }

    if (isEditMode) {
      testState.actions.reset();
      await navigate(
        resolvePersonalityExitNavigation({
          returnTo,
          returnSearch,
          returnSection,
        }),
      );
      return;
    }

    const nextSearch = buildPersonalityNextSearch({
      mbti: testState.result?.type ?? null,
      returnTo,
      returnSearch,
      returnSection,
    });

    await navigate({
      to: "/onboarding/interests",
      search: toOptionalOnboardingSearch(nextSearch),
    });
  }

  async function goBack() {
    if (isEditMode) {
      testState.actions.reset();
      await navigate(
        resolvePersonalityExitNavigation({
          returnTo,
          returnSearch,
          returnSection,
        }),
      );
      return;
    }

    const previousSearch = buildPersonalityPreviousSearch({
      returnTo,
      returnSearch,
      returnSection,
    });

    await navigate({
      to: "/onboarding/profile",
      search: toOptionalOnboardingSearch(previousSearch),
    });
  }

  const displayProgress = (() => {
    if (testState.screen.id !== "length" || !pendingLength) {
      return testState.progress;
    }

    const pool = buildQuestionList(pendingLength);
    const answeredInPool = pool.filter(
      (question) => testState.answers[question.id] !== undefined,
    ).length;

    return pool.length === 0 ? 0 : answeredInPool / pool.length;
  })();

  useScrollToTop(
    [
      testState.screen.id,
      "currentPage" in testState.screen
        ? testState.screen.currentPage
        : undefined,
      "type" in testState.screen ? testState.screen.type : undefined,
    ],
    scrollContainerRef,
  );

  const backDestination = isEditMode
    ? getOnboardingReturnDestinationLabel(returnTo, null, "settings")
    : "profile";

  return {
    backLabel: buildBackToLabel(backDestination),
    continueLabel: isEditMode ? "Save Personality" : "Continue",
    continueToInterests,
    displayProgress,
    goBack,
    isEditMode,
    scrollContainerRef,
    setPendingLength,
    testState,
  };
}
