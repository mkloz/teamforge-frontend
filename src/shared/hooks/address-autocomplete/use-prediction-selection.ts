import { useState } from "react";
import { createAddressAutocompleteDraftInput } from "@/shared/hooks/use-address-autocomplete-state";
import { resolvePlacePrediction } from "@/shared/lib/maps/google-places-service";
import type { LocationValue } from "@/shared/lib/maps/location.types";
import type { UsePredictionSelectionInput } from "./address-autocomplete-types";

export function usePredictionSelection({
  clearMessage,
  closeSuggestions,
  externalInputValue,
  hasTypedInSessionRef,
  mapsReady,
  onLocationSelect,
  resetSuggestions,
  setDraftInput,
  setHasCurrentAreaError,
  showMessage,
  skipPredictionsForValueRef,
}: UsePredictionSelectionInput) {
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);

  function beginPredictionResolution(prediction: GoogleAutocompletePrediction) {
    setIsResolvingPlace(true);
    clearMessage();
    setHasCurrentAreaError(false);
    hasTypedInSessionRef.current = false;
    skipPredictionsForValueRef.current = prediction.description;
    resetSuggestions();
  }

  function applyResolvedPrediction(nextLocation: LocationValue) {
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

  async function selectPrediction(prediction: GoogleAutocompletePrediction) {
    if (!mapsReady) {
      return;
    }

    beginPredictionResolution(prediction);

    try {
      const nextLocation = await resolvePlacePrediction(prediction);

      applyResolvedPrediction(nextLocation);
      return;
    } catch {
      showMessage(
        "We couldn't read that location. Try another result.",
        "error",
      );
      closeSuggestions();
      setIsResolvingPlace(false);
    }
  }

  return {
    isResolvingPlace,
    selectPrediction,
  };
}
