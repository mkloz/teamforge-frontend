import type {
  AddressAutocompleteDraftInput,
  AddressAutocompleteMessage,
} from "@/shared/hooks/use-address-autocomplete-state";
import {
  getAddressAutocompleteInputValue,
  getAddressAutocompleteMessageOutput,
  getExternalAddressInputValue,
  isResolvedLocationSettled,
} from "@/shared/hooks/use-address-autocomplete-state";
import type { LocationValue } from "@/shared/lib/maps/location.types";

interface UseAddressAutocompleteDerivedStateInput {
  draftInput: AddressAutocompleteDraftInput | null;
  message: AddressAutocompleteMessage | null;
  value: LocationValue | null;
}

export function useAddressAutocompleteDerivedState({
  draftInput,
  message,
  value,
}: UseAddressAutocompleteDerivedStateInput) {
  const externalInputValue = getExternalAddressInputValue(value);
  const inputValue = getAddressAutocompleteInputValue({
    draftInput,
    externalInputValue,
  });
  const messageOutput = getAddressAutocompleteMessageOutput(message);

  return {
    externalInputValue,
    inputValue,
    isSettledResolvedValue: isResolvedLocationSettled(value, inputValue),
    messageOutput,
  };
}
