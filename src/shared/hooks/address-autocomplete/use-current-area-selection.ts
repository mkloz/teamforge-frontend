import { useState } from "react";
import {
  createCurrentAreaLocation,
  getCurrentAreaErrorMessage,
} from "@/shared/hooks/use-address-autocomplete-state";
import {
  getCurrentCoordinates,
  isGeolocationAvailable,
} from "@/shared/lib/maps/browser-geolocation";
import type { UseCurrentAreaSelectionInput } from "./address-autocomplete-types";

export function useCurrentAreaSelection({
  currentLocation,
  endPlacesSession,
  hasTypedInSessionRef,
  invalidatePredictionResolution,
  invalidateSuggestionRequests,
  onLocationSelect,
  resetSuggestions,
  setDraftInput,
  setHasCurrentAreaError,
  showMessage,
  skipPredictionsForValueRef,
}: UseCurrentAreaSelectionInput) {
  const [isLocating, setIsLocating] = useState(false);

  function prepareForCurrentAreaLookup() {
    setIsLocating(true);
    showMessage("Finding your location...", "info");
    setHasCurrentAreaError(false);
    hasTypedInSessionRef.current = false;
    resetSuggestions();
  }

  function applyCurrentArea(coordinates: { lat: number; lng: number }) {
    const nextLocation = createCurrentAreaLocation(
      coordinates,
      currentLocation,
    );
    skipPredictionsForValueRef.current = nextLocation.address;
    setIsLocating(false);
    setHasCurrentAreaError(false);
    showMessage(
      currentLocation?.address
        ? "Private coordinates added to this location."
        : "Private coordinates added. You can type a city or venue as the label.",
      "info",
    );
    onLocationSelect(nextLocation);
    setDraftInput(null);
  }

  async function useCurrentArea() {
    invalidatePredictionResolution();
    invalidateSuggestionRequests();
    endPlacesSession();

    if (!isGeolocationAvailable()) {
      showMessage("Location access is unavailable in this browser.", "error");
      setHasCurrentAreaError(true);
      return;
    }

    prepareForCurrentAreaLookup();

    try {
      const coordinates = await getCurrentCoordinates();
      applyCurrentArea(coordinates);
      return;
    } catch (error) {
      showMessage(getCurrentAreaErrorMessage(error), "error");
      setHasCurrentAreaError(true);
      setIsLocating(false);
    }
  }

  return {
    isLocating,
    useCurrentArea,
  };
}
