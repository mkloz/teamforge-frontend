import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { useInvalidateCurrentUser } from "@/shared/api/current-user-query";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { resolveOnboardingExitNavigation } from "@/features/onboarding/lib/onboarding-exit-route";

import { OnboardingCache } from "../api/onboarding-cache";
import { OnboardingCommands } from "../api/onboarding-commands";
import { buildQuestionList, type TestLength } from "../data/ipip-questions";
import { getOceanScoresFromVector } from "../lib/personality-results";
import { QUESTIONS_PER_PAGE } from "../lib/personality-test-page-constants";
import { useOnboardingFlowState } from "../lib/onboarding-flow-state";
import { usePersonalityTest } from "./use-personality-test";

function buildFlowSearch({
  returnTo,
  returnSearch,
  returnSection,
}: ReturnType<typeof useOnboardingFlowState>) {
  return {
    ...(returnTo ? { returnTo } : {}),
    ...(returnSearch ? { returnSearch } : {}),
    ...(returnSection ? { returnSection } : {}),
  };
}

export function usePersonalityTestPageFlow() {
  const [pendingLength, setPendingLength] = useState<TestLength | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isEditMode, returnTo, returnSearch, returnSection } =
    useOnboardingFlowState();
  const queryClient = useQueryClient();
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const { mutateAsync: persistPersonality } = useMutation({
    mutationFn: OnboardingCommands.updatePersonality,
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

    testState.actions.reset();

    if (isEditMode) {
      await navigate(
        resolveOnboardingExitNavigation(
          returnTo,
          returnSearch,
          returnSection,
          "settings",
        ),
      );
      return;
    }

    const mbtiType = testState.result?.type ?? null;
    const nextSearch = {
      ...(mbtiType ? { mbti: mbtiType } : {}),
      ...(returnTo ? { returnTo } : {}),
      ...(returnSearch ? { returnSearch } : {}),
      ...(returnSection ? { returnSection } : {}),
    };

    await navigate({
      to: "/onboarding/interests",
      search: Object.keys(nextSearch).length > 0 ? nextSearch : undefined,
    });
  }

  async function goBack() {
    if (isEditMode) {
      testState.actions.reset();
      await navigate(
        resolveOnboardingExitNavigation(
          returnTo,
          returnSearch,
          returnSection,
          "settings",
        ),
      );
      return;
    }

    const previousSearch = buildFlowSearch({
      mode: null,
      isEditMode,
      returnTo,
      returnSearch,
      returnSection,
      mbti: null,
    });

    await navigate({
      to: "/onboarding/profile",
      search:
        Object.keys(previousSearch).length > 0 ? previousSearch : undefined,
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

  return {
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
