import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";
import type { SuggestionNavigationDirection } from "@/shared/hooks/use-address-autocomplete-state";
import {
  getActiveSuggestionIndexForVisibleState,
  getPredictionRequestDecision,
  getVisibleAutocompleteSuggestions,
  getWrappedSuggestionIndex,
} from "@/shared/hooks/use-address-autocomplete-state";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";
import {
  createGooglePlacesSessionToken,
  getGooglePlacesErrorMessage,
  getPlaceSuggestions,
} from "@/shared/lib/maps/google-places-service";
import type { GooglePlaceSuggestion } from "@/shared/lib/maps/location.types";
import type { MutableValueRef } from "./address-autocomplete-types";

interface UseAutocompleteSuggestionsInput {
  hasTypedInSessionRef: MutableValueRef<boolean>;
  inputValue: string;
  isSettledResolvedValue: boolean;
  mapsReady: boolean;
  sessionTokenRef: MutableValueRef<GoogleAutocompleteSessionToken | null>;
  showMessage: (text: string, tone: "error" | "info") => void;
  skipPredictionsForValueRef: MutableValueRef<string | null>;
}

interface RefreshAutocompletePredictionsInput {
  hasTypedInSessionRef: MutableValueRef<boolean>;
  inputValue: string;
  isActive: () => boolean;
  resetSuggestions: () => void;
  setActiveSuggestionIndex: Dispatch<SetStateAction<number>>;
  setIsSuggestionsOpen: Dispatch<SetStateAction<boolean>>;
  sessionTokenRef: MutableValueRef<GoogleAutocompleteSessionToken | null>;
  setSuggestions: Dispatch<SetStateAction<GooglePlaceSuggestion[]>>;
  showMessage: (text: string, tone: "error" | "info") => void;
  skipPredictionsForValueRef: MutableValueRef<string | null>;
}

async function fetchAutocompletePredictions(
  inputValue: string,
  sessionTokenRef: MutableValueRef<GoogleAutocompleteSessionToken | null>,
) {
  const sessionToken =
    sessionTokenRef.current ?? createGooglePlacesSessionToken();
  sessionTokenRef.current = sessionToken;
  return getPlaceSuggestions(inputValue.trim(), sessionToken);
}

function canApplyPredictionRefresh({
  isActive,
  skipPredictionsForValueRef,
}: Pick<
  RefreshAutocompletePredictionsInput,
  "isActive" | "skipPredictionsForValueRef"
>) {
  return isActive() && skipPredictionsForValueRef.current === null;
}

function applyPredictionRefreshResult({
  hasTypedInSessionRef,
  nextSuggestions,
  resetSuggestions,
  setActiveSuggestionIndex,
  setIsSuggestionsOpen,
  setSuggestions,
}: Pick<
  RefreshAutocompletePredictionsInput,
  | "hasTypedInSessionRef"
  | "resetSuggestions"
  | "setActiveSuggestionIndex"
  | "setIsSuggestionsOpen"
  | "setSuggestions"
> & {
  nextSuggestions: GooglePlaceSuggestion[] | null;
}) {
  if (!nextSuggestions) {
    resetSuggestions();
    return;
  }

  setSuggestions(nextSuggestions);
  setIsSuggestionsOpen(
    hasTypedInSessionRef.current && Boolean(nextSuggestions.length),
  );
  setActiveSuggestionIndex(-1);
}

async function refreshAutocompletePredictions(
  input: RefreshAutocompletePredictionsInput,
) {
  let nextSuggestions: GooglePlaceSuggestion[] | null;

  try {
    nextSuggestions = await fetchAutocompletePredictions(
      input.inputValue,
      input.sessionTokenRef,
    );
  } catch (error) {
    input.sessionTokenRef.current = null;
    if (input.isActive()) {
      input.showMessage(getGooglePlacesErrorMessage(error), "info");
    }
    nextSuggestions = null;
  }

  if (!canApplyPredictionRefresh(input)) {
    return;
  }

  applyPredictionRefreshResult({
    hasTypedInSessionRef: input.hasTypedInSessionRef,
    nextSuggestions,
    resetSuggestions: input.resetSuggestions,
    setActiveSuggestionIndex: input.setActiveSuggestionIndex,
    setIsSuggestionsOpen: input.setIsSuggestionsOpen,
    setSuggestions: input.setSuggestions,
  });
}

export function useAutocompleteSuggestions({
  hasTypedInSessionRef,
  inputValue,
  isSettledResolvedValue,
  mapsReady,
  sessionTokenRef,
  showMessage,
  skipPredictionsForValueRef,
}: UseAutocompleteSuggestionsInput) {
  const [suggestions, setSuggestions] = useState<GooglePlaceSuggestion[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const visibleSuggestions = getVisibleAutocompleteSuggestions(
    mapsReady,
    inputValue,
    suggestions,
  );

  const resetSuggestions = useCallback(() => {
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
  }, []);

  useEffect(() => {
    setActiveSuggestionIndex((currentIndex) => {
      return getActiveSuggestionIndexForVisibleState(
        currentIndex,
        isSuggestionsOpen,
        visibleSuggestions.length,
      );
    });
  }, [isSuggestionsOpen, visibleSuggestions.length]);

  useEffect(() => {
    const predictionRequestDecision = getPredictionRequestDecision({
      hasSkippedValue: skipPredictionsForValueRef.current !== null,
      hasTypedInSession: hasTypedInSessionRef.current,
      inputValue,
      isSettledResolvedValue,
      mapsReady,
    });

    if (predictionRequestDecision !== "request") {
      if (predictionRequestDecision === "clear") {
        resetSuggestions();
      }

      return undefined;
    }

    let active = true;
    const handle = scheduleDelay(() => {
      void refreshAutocompletePredictions({
        hasTypedInSessionRef,
        inputValue,
        isActive: () => active,
        resetSuggestions,
        sessionTokenRef,
        setActiveSuggestionIndex,
        setIsSuggestionsOpen,
        setSuggestions,
        showMessage,
        skipPredictionsForValueRef,
      });
    }, 250);

    return () => {
      active = false;
      cancelDelay(handle);
    };
  }, [
    hasTypedInSessionRef,
    inputValue,
    isSettledResolvedValue,
    mapsReady,
    resetSuggestions,
    sessionTokenRef,
    showMessage,
    skipPredictionsForValueRef,
  ]);

  const closeSuggestions = useCallback(() => {
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
  }, []);

  function openSuggestions() {
    if (!hasTypedInSessionRef.current) {
      return;
    }

    if (visibleSuggestions.length === 0) {
      return;
    }

    setIsSuggestionsOpen(true);
  }

  function moveActiveSuggestion(direction: SuggestionNavigationDirection) {
    setIsSuggestionsOpen(true);
    setActiveSuggestionIndex((currentIndex) =>
      getWrappedSuggestionIndex(
        currentIndex,
        visibleSuggestions.length,
        direction,
      ),
    );
  }

  return {
    activeSuggestionIndex,
    closeSuggestions,
    isSuggestionsOpen,
    moveActiveSuggestion,
    openSuggestions,
    resetSuggestions,
    setActiveSuggestionIndex,
    suggestions: visibleSuggestions,
  };
}
