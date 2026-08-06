import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useCompatibilityInputLock } from "@/features/forge-proposals/public/proposal-review";
import { ensureOnboardingProductState } from "@/shared/api/onboarding-product-state-query";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { warnInDevelopment } from "@/shared/lib/development-warning";

import {
  buildInterestsFlowSearch,
  getInterestsProgress,
  resolveInterestsExitNavigation,
} from "../lib/interests-page-flow";
import {
  toOptionalOnboardingSearch,
  useOnboardingFlowState,
} from "../lib/onboarding-flow-state";
import {
  buildBackToLabel,
  getOnboardingReturnDestinationLabel,
} from "../lib/onboarding-navigation-labels";
import { useInterests } from "./use-interests";

export function useInterestsPageFlow() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);
  const [didFinishEdit, setDidFinishEdit] = useState(false);
  const navigate = useNavigate();
  const {
    isEditMode,
    mbti,
    returnTo,
    returnSearch,
    returnSection,
    returnGroupId,
  } = useOnboardingFlowState();
  const compatibilityInputLock = useCompatibilityInputLock({
    enabled: isEditMode,
  });

  const state = useInterests({
    blockedSaveMessage: compatibilityInputLock.isBlocked
      ? compatibilityInputLock.message
      : null,
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
          returnGroupId,
        },
        "settings",
      ),
    );
  }, [
    didFinishEdit,
    navigate,
    reset,
    returnGroupId,
    returnSearch,
    returnSection,
    returnTo,
  ]);

  useScrollToTop([state.screen], scrollContainerRef);

  const progress = getInterestsProgress(state.selectedCount);
  const backDestination = isEditMode
    ? getOnboardingReturnDestinationLabel(returnTo, null, "settings")
    : "personality";

  async function enterApp() {
    state.reset();

    if (returnTo) {
      await navigate(
        resolveInterestsExitNavigation(
          { returnTo, returnSearch, returnSection, returnGroupId },
          "home",
        ),
      );
      return;
    }

    try {
      const productState = await ensureOnboardingProductState();
      await navigate({
        to:
          productState.presentation.destination === "FORGE"
            ? "/forge"
            : "/explore",
      });
      return;
    } catch (error) {
      warnInDevelopment(
        "Onboarding practice state could not be loaded after interests.",
        error,
      );
    }

    await navigate(
      resolveInterestsExitNavigation(
        {
          returnTo,
          returnSearch,
          returnSection,
          returnGroupId,
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
            returnGroupId,
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
      returnGroupId,
      mbti,
    });

    void navigate({
      to: "/onboarding/personality",
      search: toOptionalOnboardingSearch(previousSearch),
    });
  }

  return {
    backLabel: buildBackToLabel(backDestination),
    compatibilityInputLock,
    enterApp,
    goBack,
    isDone,
    isEditMode,
    progress,
    scrollContainerRef,
    state,
  };
}
