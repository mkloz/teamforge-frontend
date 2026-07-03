import {
  getActiveSuggestionId,
  getAddressInputRightPaddingClassName,
  getLocationHintMessage,
} from "@/shared/components/maps/address-autocomplete/address-autocomplete-utils";
import type { AddressAutocompleteMessageTone } from "@/shared/hooks/use-address-autocomplete-state";
import type { GoogleMapsStatus } from "@/shared/lib/maps/location.types";

export interface AddressAutocompleteRenderStateInput {
  activeSuggestionIndex: number;
  hint: string;
  hintId: string;
  inputValue: string;
  isLocating: boolean;
  isResolvingPlace: boolean;
  isSuggestionsOpen: boolean;
  mapsReady: boolean;
  mapsStatus: GoogleMapsStatus;
  message: string | null;
  messageTone: AddressAutocompleteMessageTone | null;
  suggestions: GoogleAutocompletePrediction[];
  suggestionsId: string;
}

function isAddressAutocompleteBusy({
  isLocating,
  isResolvingPlace,
  mapsStatus,
}: Pick<
  AddressAutocompleteRenderStateInput,
  "isLocating" | "isResolvingPlace" | "mapsStatus"
>) {
  return mapsStatus === "loading" || isResolvingPlace || isLocating;
}

function shouldShowAddressBusyIndicator({
  isBusy,
  isLocating,
}: {
  isBusy: boolean;
  isLocating: boolean;
}) {
  return isBusy && !isLocating;
}

function shouldRenderAddressInputControls({
  inputValue,
  isBusy,
  mapsReady,
}: Pick<AddressAutocompleteRenderStateInput, "inputValue" | "mapsReady"> & {
  isBusy: boolean;
}) {
  return mapsReady || isBusy || Boolean(inputValue);
}

function getAddressAutocompleteDescribedBy({
  hintId,
  message,
  showManualHint,
}: Pick<AddressAutocompleteRenderStateInput, "hintId" | "message"> & {
  showManualHint: boolean;
}) {
  return message || showManualHint ? hintId : undefined;
}

export function getAddressAutocompleteRenderState(
  input: AddressAutocompleteRenderStateInput,
) {
  const showManualHint = input.mapsStatus === "unavailable";
  const isBusy = isAddressAutocompleteBusy(input);
  const showBusyIndicator = shouldShowAddressBusyIndicator({
    isBusy,
    isLocating: input.isLocating,
  });

  return {
    activeSuggestionId: getActiveSuggestionId({
      activeSuggestionIndex: input.activeSuggestionIndex,
      isSuggestionsOpen: input.isSuggestionsOpen,
      suggestions: input.suggestions,
      suggestionsId: input.suggestionsId,
    }),
    describedBy: getAddressAutocompleteDescribedBy({
      hintId: input.hintId,
      message: input.message,
      showManualHint,
    }),
    hasErrorMessage: input.messageTone === "error",
    hasRightControls: shouldRenderAddressInputControls({
      inputValue: input.inputValue,
      isBusy,
      mapsReady: input.mapsReady,
    }),
    hintMessage: getLocationHintMessage({
      hint: input.hint,
      message: input.message,
      showManualHint,
    }),
    isBusy,
    rightPaddingClassName: getAddressInputRightPaddingClassName({
      inputValue: input.inputValue,
      mapsReady: input.mapsReady,
      showBusyIndicator,
    }),
  };
}

export type AddressAutocompleteRenderState = ReturnType<
  typeof getAddressAutocompleteRenderState
>;
