import type {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  SetStateAction,
} from "react";

import type {
  MutableValueRef,
  RequestGoogleMaps,
} from "@/shared/hooks/address-autocomplete/address-autocomplete-types";
import { handleSuggestionKeyboardAction } from "@/shared/hooks/address-autocomplete/suggestion-keyboard";
import type {
  AddressAutocompleteDraftInput,
  SuggestionNavigationDirection,
} from "@/shared/hooks/use-address-autocomplete-state";
import {
  canUseAutocompleteSuggestions,
  getManualAddressInputChange,
  getSuggestionKeyboardAction,
} from "@/shared/hooks/use-address-autocomplete-state";
import type {
  GooglePlaceSuggestion,
  LocationValue,
} from "@/shared/lib/maps/location.types";

interface UseAddressAutocompleteActionsInput {
  activeSuggestionIndex: number;
  clearMessage: () => void;
  closeSuggestions: () => void;
  externalInputValue: string;
  endPlacesSession: () => void;
  hasTypedInSessionRef: MutableValueRef<boolean>;
  invalidatePredictionResolution: () => void;
  invalidateSuggestionRequests: () => void;
  isSuggestionsOpen: boolean;
  moveActiveSuggestion: (direction: SuggestionNavigationDirection) => void;
  onLocationSelect: (value: LocationValue | null) => void;
  openSuggestions: () => void;
  requestGoogleMaps: RequestGoogleMaps;
  resetSuggestions: () => void;
  selectPrediction: (prediction: GooglePlaceSuggestion) => Promise<void>;
  setDraftInput: Dispatch<SetStateAction<AddressAutocompleteDraftInput | null>>;
  setHasCurrentAreaError: Dispatch<SetStateAction<boolean>>;
  skipPredictionsForValueRef: MutableValueRef<string | null>;
  visibleSuggestions: GooglePlaceSuggestion[];
}

export function useAddressAutocompleteActions({
  activeSuggestionIndex,
  clearMessage,
  closeSuggestions,
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
}: UseAddressAutocompleteActionsInput) {
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const manualInputChange = getManualAddressInputChange(
      event.target.value,
      externalInputValue,
    );

    const continuesPlacesSession = hasTypedInSessionRef.current;
    invalidatePredictionResolution();
    invalidateSuggestionRequests();
    if (!continuesPlacesSession) {
      endPlacesSession();
    }
    hasTypedInSessionRef.current = true;
    skipPredictionsForValueRef.current = null;
    if (manualInputChange.hasSearchableInput) {
      void requestGoogleMaps();
    }
    setDraftInput(manualInputChange.draftInput);
    clearMessage();
    setHasCurrentAreaError(false);
    if (!manualInputChange.hasSearchableInput) {
      endPlacesSession();
      resetSuggestions();
    }
    onLocationSelect(manualInputChange.locationValue);
  }

  function clearLocation() {
    invalidatePredictionResolution();
    invalidateSuggestionRequests();
    hasTypedInSessionRef.current = false;
    skipPredictionsForValueRef.current = null;
    setDraftInput(null);
    resetSuggestions();
    clearMessage();
    setHasCurrentAreaError(false);
    endPlacesSession();
    onLocationSelect(null);
  }

  function handleInputFocus() {
    void requestGoogleMaps();
    openSuggestions();
  }

  function selectActiveSuggestion(event: KeyboardEvent<HTMLInputElement>) {
    const suggestion = visibleSuggestions[activeSuggestionIndex];

    if (!suggestion) {
      return;
    }

    event.preventDefault();
    void selectPrediction(suggestion);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const keyboardAction = getSuggestionKeyboardAction({
      activeSuggestionIndex,
      canUseSuggestions: canUseAutocompleteSuggestions(
        visibleSuggestions.length,
        hasTypedInSessionRef.current,
      ),
      isSuggestionsOpen,
      key: event.key,
    });

    handleSuggestionKeyboardAction({
      closeSuggestions,
      event,
      keyboardAction,
      moveActiveSuggestion,
      selectActiveSuggestion,
    });
  }

  return {
    clearLocation,
    handleInputChange,
    handleInputFocus,
    handleInputKeyDown,
  };
}
