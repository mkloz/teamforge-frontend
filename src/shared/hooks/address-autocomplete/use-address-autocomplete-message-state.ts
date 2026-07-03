import { useState } from "react";
import type {
  AddressAutocompleteMessage,
  AddressAutocompleteMessageTone,
} from "@/shared/hooks/use-address-autocomplete-state";

export function useAddressAutocompleteMessageState() {
  const [message, setMessage] = useState<AddressAutocompleteMessage | null>(
    null,
  );
  const [hasCurrentAreaError, setHasCurrentAreaError] = useState(false);

  function showMessage(text: string, tone: AddressAutocompleteMessageTone) {
    setMessage({ text, tone });
  }

  function clearMessage() {
    setMessage(null);
  }

  return {
    clearMessage,
    hasCurrentAreaError,
    message,
    setHasCurrentAreaError,
    showMessage,
  };
}
