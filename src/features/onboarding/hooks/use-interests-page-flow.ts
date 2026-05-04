import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { resolveOnboardingExitNavigation } from "@/features/onboarding/lib/onboarding-exit-route";

import { MIN_INTERESTS } from "../data/interests-data";
import { useInterests } from "./use-interests";
import { useOnboardingFlowState } from "../lib/onboarding-flow-state";

function buildFlowSearch({
  returnTo,
  returnSearch,
  returnSection,
  mbti,
}: ReturnType<typeof useOnboardingFlowState>) {
  return {
    ...(returnTo ? { returnTo } : {}),
    ...(returnSearch ? { returnSearch } : {}),
    ...(returnSection ? { returnSection } : {}),
    ...(mbti ? { mbti } : {}),
  };
}

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
      resolveOnboardingExitNavigation(
        returnTo,
        returnSearch,
        returnSection,
        "settings",
      ),
    );
  }, [didFinishEdit, navigate, reset, returnSearch, returnSection, returnTo]);

  useScrollToTop([state.screen], scrollContainerRef);

  const progress = Math.min(state.selectedCount / MIN_INTERESTS, 1);

  function enterApp() {
    state.reset();
    void navigate(
      resolveOnboardingExitNavigation(
        returnTo,
        returnSearch,
        returnSection,
        "home",
      ),
    );
  }

  function goBack() {
    if (isEditMode) {
      state.reset();
      void navigate(
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
      mbti,
    });

    void navigate({
      to: "/onboarding/personality",
      search:
        Object.keys(previousSearch).length > 0 ? previousSearch : undefined,
    });
  }

  return {
    enterApp,
    goBack,
    isDone,
    isEditMode,
    progress,
    scrollContainerRef,
    state,
  };
}
