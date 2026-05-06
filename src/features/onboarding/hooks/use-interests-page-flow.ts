import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";

import {
  buildInterestsFlowSearch,
  getInterestsProgress,
  resolveInterestsExitNavigation,
} from "../lib/interests-page-flow";
import {
  buildBackToLabel,
  getOnboardingReturnDestinationLabel,
} from "../lib/onboarding-navigation-labels";
import { useInterests } from "./use-interests";
import { useOnboardingFlowState } from "../lib/onboarding-flow-state";
import { usePersonalityTestStore } from "../store/personality-test-store";

export function useInterestsPageFlow() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);
  const [didFinishEdit, setDidFinishEdit] = useState(false);
  const navigate = useNavigate();
  const { isEditMode, mbti, returnTo, returnSearch, returnSection } =
    useOnboardingFlowState();

  const state = useInterests({
    personalityTypeHint: mbti,
    onComplete: () => {
      if (isEditMode) {
        setDidFinishEdit(true);
        return;
      }

      setIsDone(true);
    },
  });
  const { reset, screen, setScreen } = state;

  useEffect(() => {
    if (isEditMode && screen === "intro") {
      setScreen("browse");
    }
  }, [isEditMode, screen, setScreen]);

  useEffect(() => {
    if (!didFinishEdit) {
      return;
    }

    reset();
    void navigate(
      resolveInterestsExitNavigation(
        {
          returnTo,
          returnSearch,
          returnSection,
        },
        "settings",
      ),
    );
  }, [didFinishEdit, navigate, reset, returnSearch, returnSection, returnTo]);

  useScrollToTop([state.screen], scrollContainerRef);

  const progress = getInterestsProgress(state.selectedCount);
  const backDestination = isEditMode
    ? getOnboardingReturnDestinationLabel(returnTo, null, "settings")
    : "personality";

  function enterApp() {
    state.reset();
    usePersonalityTestStore.getState().reset();
    void navigate(
      resolveInterestsExitNavigation(
        {
          returnTo,
          returnSearch,
          returnSection,
        },
        "home",
      ),
    );
  }

  function goBack() {
    if (isEditMode) {
      state.reset();
      void navigate(
        resolveInterestsExitNavigation(
          {
            returnTo,
            returnSearch,
            returnSection,
          },
          "settings",
        ),
      );
      return;
    }

    const previousSearch = buildInterestsFlowSearch({
      returnTo,
      returnSearch,
      returnSection,
      mbti,
    });

    void navigate({
      to: "/onboarding/personality",
      search:
        Object.keys(previousSearch).length > 0 ? previousSearch : undefined,
    });
  }

  return {
    backLabel: buildBackToLabel(backDestination),
    enterApp,
    goBack,
    isDone,
    isEditMode,
    progress,
    scrollContainerRef,
    state,
  };
}
