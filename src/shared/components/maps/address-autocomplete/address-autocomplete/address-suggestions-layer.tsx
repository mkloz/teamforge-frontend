import {
  AddressSuggestionsPanel,
  type AddressSuggestionsPanelProps,
} from "@/shared/components/maps/address-autocomplete/address-suggestions-panel";

interface AddressSuggestionsLayerProps extends AddressSuggestionsPanelProps {
  isSuggestionsOpen: boolean;
}

export function AddressSuggestionsLayer({
  isSuggestionsOpen,
  ...panelProps
}: AddressSuggestionsLayerProps) {
  if (!isSuggestionsOpen) {
    return null;
  }

  return <AddressSuggestionsPanel {...panelProps} />;
}
