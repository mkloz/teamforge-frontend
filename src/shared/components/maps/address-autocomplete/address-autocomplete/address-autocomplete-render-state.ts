import {
  getActiveSuggestionId,
  getAddressInputRightPaddingClassName,
  getLocationHintMessage,
} from "@/shared/components/maps/address-autocomplete/address-autocomplete-utils";
import type { AddressAutocompleteMessageTone } from "@/shared/hooks/use-address-autocomplete-state";
import type {
  GoogleMapsStatus,
  GooglePlaceSuggestion,
} from "@/shared/lib/maps/location.types";

export interface AddressAutocompleteRenderStateInput {
  activeSuggestionIndex: number;
  geolocationAvailable: boolean;
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
  suggestions: GooglePlaceSuggestion[];
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
  showLocateControl,
}: Pick<AddressAutocompleteRenderStateInput, "inputValue"> & {
  isBusy: boolean;
  showLocateControl: boolean;
}) {
  return showLocateControl || isBusy || Boolean(inputValue);
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
  const showLocateControl = input.geolocationAvailable;
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
      showLocateControl,
    }),
    hintMessage: getLocationHintMessage({
      hint: input.hint,
      message: input.message,
      showManualHint,
    }),
    isBusy,
    rightPaddingClassName: getAddressInputRightPaddingClassName({
      inputValue: input.inputValue,
      showLocateControl,
      showBusyIndicator,
    }),
  };
}

export type AddressAutocompleteRenderState = ReturnType<
  typeof getAddressAutocompleteRenderState
>;
