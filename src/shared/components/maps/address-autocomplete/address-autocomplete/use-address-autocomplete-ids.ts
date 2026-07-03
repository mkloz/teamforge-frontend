import { useId } from "react";

export function useAddressAutocompleteIds() {
  const inputId = useId();

  return {
    hintId: `${inputId}-hint`,
    inputId,
    suggestionsId: `${inputId}-suggestions`,
  };
}
