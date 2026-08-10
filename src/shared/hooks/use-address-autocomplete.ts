import { useCallback, useEffect, useRef, useState } from "react";

import { useAddressAutocompleteActions } from "@/shared/hooks/address-autocomplete/use-address-autocomplete-actions";
import { useAddressAutocompleteDerivedState } from "@/shared/hooks/address-autocomplete/use-address-autocomplete-derived-state";
import { useAddressAutocompleteMessageState } from "@/shared/hooks/address-autocomplete/use-address-autocomplete-message-state";
import { useAutocompleteSuggestions } from "@/shared/hooks/address-autocomplete/use-autocomplete-suggestions";
import { useCurrentAreaSelection } from "@/shared/hooks/address-autocomplete/use-current-area-selection";
import { usePredictionSelection } from "@/shared/hooks/address-autocomplete/use-prediction-selection";
import type { AddressAutocompleteDraftInput } from "@/shared/hooks/use-address-autocomplete-state";
import { useGoogleMapsStatus } from "@/shared/hooks/use-google-maps-status";
import { isGeolocationAvailable } from "@/shared/lib/maps/browser-geolocation";
import type { LocationValue } from "@/shared/lib/maps/location.types";

interface UseAddressAutocompleteOptions {
  value: LocationValue | null;
  onLocationSelect: (value: LocationValue | null) => void;
}

export function useAddressAutocomplete({
  value,
  onLocationSelect,
}: UseAddressAutocompleteOptions) {
  const [draftInput, setDraftInput] =
    useState<AddressAutocompleteDraftInput | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTypedInSessionRef = useRef(false);
  const skipPredictionsForValueRef = useRef<string | null>(null);
  const sessionTokenRef = useRef<GoogleAutocompleteSessionToken | null>(null);
  const suggestionRequestGenerationRef = useRef(0);
  const geolocationAvailable = isGeolocationAvailable();
  const endPlacesSession = useCallback(() => {
    sessionTokenRef.current = null;
  }, []);
  const invalidateSuggestionRequests = useCallback(() => {
    suggestionRequestGenerationRef.current += 1;
  }, []);
  const { mapsStatus, mapsReady, requestGoogleMaps } = useGoogleMapsStatus({
    loadOnMount: false,
  });
  const {
    clearMessage,
    hasCurrentAreaError,
    message,
    setHasCurrentAreaError,
    showMessage,
  } = useAddressAutocompleteMessageState();
  const {
    externalInputValue,
    inputValue,
    isSettledResolvedValue,
    messageOutput,
  } = useAddressAutocompleteDerivedState({
    draftInput,
    message,
    value,
  });
  const {
    activeSuggestionIndex,
    closeSuggestions,
    isSuggestionsOpen,
    moveActiveSuggestion,
    openSuggestions,
    resetSuggestions,
    setActiveSuggestionIndex,
    suggestions: visibleSuggestions,
  } = useAutocompleteSuggestions({
    hasTypedInSessionRef,
    inputValue,
    isSettledResolvedValue,
    mapsReady,
    requestGenerationRef: suggestionRequestGenerationRef,
    sessionTokenRef,
    showMessage,
    skipPredictionsForValueRef,
  });
  const { invalidatePredictionResolution, isResolvingPlace, selectPrediction } =
    usePredictionSelection({
      clearMessage,
      closeSuggestions,
      endPlacesSession,
      externalInputValue,
      hasTypedInSessionRef,
      invalidateSuggestionRequests,
      onLocationSelect,
      resetSuggestions,
      setDraftInput,
      setHasCurrentAreaError,
      showMessage,
      skipPredictionsForValueRef,
    });
  const abandonPlacesSession = useCallback(() => {
    invalidatePredictionResolution();
    invalidateSuggestionRequests();
    endPlacesSession();
    resetSuggestions();
  }, [
    endPlacesSession,
    invalidatePredictionResolution,
    invalidateSuggestionRequests,
    resetSuggestions,
  ]);
  const { isLocating, useCurrentArea } = useCurrentAreaSelection({
    currentLocation: value,
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
  });

  const {
    clearLocation,
    handleInputChange,
    handleInputFocus,
    handleInputKeyDown,
  } = useAddressAutocompleteActions({
    activeSuggestionIndex,
    clearMessage,
    closeSuggestions: abandonPlacesSession,
    externalInputValue,
    endPlacesSession,
    hasTypedInSessionRef,
    invalidatePredictionResolution,
    invalidateSuggestionRequests,
    isSuggestionsOpen,
    moveActiveSuggestion,
    onLocationSelect,
    openSuggestions,
    requestGoogleMaps,
    resetSuggestions,
    selectPrediction,
    setDraftInput,
    setHasCurrentAreaError,
    skipPredictionsForValueRef,
    visibleSuggestions,
  });

  function resetInputDraft() {
    invalidatePredictionResolution();
    invalidateSuggestionRequests();
    hasTypedInSessionRef.current = false;
    skipPredictionsForValueRef.current = null;
    setDraftInput(null);
    resetSuggestions();
    closeSuggestions();
    clearMessage();
    setHasCurrentAreaError(false);
    endPlacesSession();
  }

  useEffect(
    () => () => {
      invalidateSuggestionRequests();
      endPlacesSession();
    },
    [endPlacesSession, invalidateSuggestionRequests],
  );

  useEffect(() => {
    if (mapsStatus !== "unavailable") {
      return;
    }

    invalidatePredictionResolution();
    invalidateSuggestionRequests();
    endPlacesSession();
    resetSuggestions();
    closeSuggestions();
  }, [
    closeSuggestions,
    endPlacesSession,
    invalidatePredictionResolution,
    invalidateSuggestionRequests,
    mapsStatus,
    resetSuggestions,
  ]);

  return {
    containerRef,
    inputValue,
    mapsStatus,
    mapsReady,
    geolocationAvailable,
    suggestions: visibleSuggestions,
    isSuggestionsOpen,
    activeSuggestionIndex,
    isResolvingPlace,
    isLocating,
    message: messageOutput.message,
    messageTone: messageOutput.messageTone,
    hasCurrentAreaError,
    setActiveSuggestionIndex,
    handleInputFocus,
    handleInputChange,
    handleInputKeyDown,
    closeSuggestions: abandonPlacesSession,
    clearLocation,
    resetInputDraft,
    selectPrediction,
    useCurrentArea,
  };
}
