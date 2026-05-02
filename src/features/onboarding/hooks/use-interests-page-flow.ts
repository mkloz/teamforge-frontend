import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { resolveOnboardingExitNavigation } from "@/features/onboarding/lib/onboarding-exit-route";

import { MIN_INTERESTS } from "../data/interests-data";
import { useInterests } from "./use-interests";
import { useOnboardingFlowState } from "../lib/onboarding-flow-state";

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

  return {
    enterApp,
    isDone,
    isEditMode,
    progress,
    scrollContainerRef,
    state,
  };
}
