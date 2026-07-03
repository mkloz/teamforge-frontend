import { useRef, useState } from "react";

import { useAddressAutocompleteActions } from "@/shared/hooks/address-autocomplete/use-address-autocomplete-actions";
import { useAddressAutocompleteDerivedState } from "@/shared/hooks/address-autocomplete/use-address-autocomplete-derived-state";
import { useAddressAutocompleteMessageState } from "@/shared/hooks/address-autocomplete/use-address-autocomplete-message-state";
import { useAutocompleteSuggestions } from "@/shared/hooks/address-autocomplete/use-autocomplete-suggestions";
import { useCurrentAreaSelection } from "@/shared/hooks/address-autocomplete/use-current-area-selection";
import { usePredictionSelection } from "@/shared/hooks/address-autocomplete/use-prediction-selection";
import type { AddressAutocompleteDraftInput } from "@/shared/hooks/use-address-autocomplete-state";
import { useGoogleMapsStatus } from "@/shared/hooks/use-google-maps-status";
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
    skipPredictionsForValueRef,
  });
  const { isResolvingPlace, selectPrediction } = usePredictionSelection({
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
  });
  const { isLocating, useCurrentArea } = useCurrentAreaSelection({
    clearMessage,
    hasTypedInSessionRef,
    mapsReady,
    onLocationSelect,
    requestGoogleMaps,
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
    closeSuggestions,
    externalInputValue,
    hasTypedInSessionRef,
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

  return {
    containerRef,
    inputValue,
    mapsStatus,
    mapsReady,
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
    closeSuggestions,
    clearLocation,
    selectPrediction,
    useCurrentArea,
  };
}
