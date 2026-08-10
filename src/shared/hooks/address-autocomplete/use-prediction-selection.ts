import { useCallback, useEffect, useRef, useState } from "react";
import { createAddressAutocompleteDraftInput } from "@/shared/hooks/use-address-autocomplete-state";
import { resolvePlaceSuggestion } from "@/shared/lib/maps/google-places-service";
import type {
  GooglePlaceSuggestion,
  LocationValue,
} from "@/shared/lib/maps/location.types";
import type { UsePredictionSelectionInput } from "./address-autocomplete-types";

export function usePredictionSelection({
  clearMessage,
  closeSuggestions,
  endPlacesSession,
  externalInputValue,
  hasTypedInSessionRef,
  onLocationSelect,
  resetSuggestions,
  setDraftInput,
  setHasCurrentAreaError,
  showMessage,
  skipPredictionsForValueRef,
}: UsePredictionSelectionInput) {
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);
  const resolutionGenerationRef = useRef(0);
  const activeResolutionGenerationRef = useRef<number | null>(null);

  const invalidatePredictionResolution = useCallback(() => {
    resolutionGenerationRef.current += 1;
    activeResolutionGenerationRef.current = null;
    setIsResolvingPlace(false);
  }, []);

  useEffect(
    () => () => {
      resolutionGenerationRef.current += 1;
      activeResolutionGenerationRef.current = null;
    },
    [],
  );

  function beginPredictionResolution(prediction: GooglePlaceSuggestion) {
    const generation = resolutionGenerationRef.current + 1;
    resolutionGenerationRef.current = generation;
    activeResolutionGenerationRef.current = generation;
    setIsResolvingPlace(true);
    clearMessage();
    setHasCurrentAreaError(false);
    hasTypedInSessionRef.current = false;
    skipPredictionsForValueRef.current = prediction.description;
    resetSuggestions();
    endPlacesSession();
    return generation;
  }

  function isCurrentResolution(generation: number) {
    return (
      resolutionGenerationRef.current === generation &&
      activeResolutionGenerationRef.current === generation
    );
  }

  function applyResolvedPrediction(
    generation: number,
    nextLocation: LocationValue,
  ) {
    if (!isCurrentResolution(generation)) {
      return;
    }

    activeResolutionGenerationRef.current = null;
    setDraftInput(
      createAddressAutocompleteDraftInput(
        externalInputValue,
        nextLocation.address,
      ),
    );
    skipPredictionsForValueRef.current = nextLocation.address;
    resetSuggestions();
    setIsResolvingPlace(false);
    onLocationSelect(nextLocation);
  }

  async function selectPrediction(prediction: GooglePlaceSuggestion) {
    const generation = beginPredictionResolution(prediction);

    try {
      const nextLocation = await resolvePlaceSuggestion(prediction);

      applyResolvedPrediction(generation, nextLocation);
      return;
    } catch {
      if (!isCurrentResolution(generation)) {
        return;
      }

      activeResolutionGenerationRef.current = null;
      showMessage(
        "We couldn't read that location. Try another result.",
        "error",
      );
      closeSuggestions();
      setIsResolvingPlace(false);
    }
  }

  return {
    invalidatePredictionResolution,
    isResolvingPlace,
    selectPrediction,
  };
}
