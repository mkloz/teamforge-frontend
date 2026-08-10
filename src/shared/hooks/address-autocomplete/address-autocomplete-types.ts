import type { Dispatch, SetStateAction } from "react";
import type {
  AddressAutocompleteDraftInput,
  AddressAutocompleteMessageTone,
} from "@/shared/hooks/use-address-autocomplete-state";
import type { LocationValue } from "@/shared/lib/maps/location.types";

export type MutableValueRef<T> = {
  current: T;
};

export type RequestGoogleMaps = () => Promise<boolean>;

export interface UsePredictionSelectionInput {
  clearMessage: () => void;
  closeSuggestions: () => void;
  externalInputValue: string;
  hasTypedInSessionRef: MutableValueRef<boolean>;
  endPlacesSession: () => void;
  onLocationSelect: (value: LocationValue) => void;
  resetSuggestions: () => void;
  setDraftInput: Dispatch<SetStateAction<AddressAutocompleteDraftInput | null>>;
  setHasCurrentAreaError: Dispatch<SetStateAction<boolean>>;
  showMessage: (text: string, tone: AddressAutocompleteMessageTone) => void;
  skipPredictionsForValueRef: MutableValueRef<string | null>;
}

export interface UseCurrentAreaSelectionInput {
  currentLocation: LocationValue | null;
  endPlacesSession: () => void;
  hasTypedInSessionRef: MutableValueRef<boolean>;
  invalidatePredictionResolution: () => void;
  onLocationSelect: (value: LocationValue) => void;
  resetSuggestions: () => void;
  setDraftInput: Dispatch<SetStateAction<AddressAutocompleteDraftInput | null>>;
  setHasCurrentAreaError: Dispatch<SetStateAction<boolean>>;
  showMessage: (text: string, tone: AddressAutocompleteMessageTone) => void;
  skipPredictionsForValueRef: MutableValueRef<string | null>;
}
