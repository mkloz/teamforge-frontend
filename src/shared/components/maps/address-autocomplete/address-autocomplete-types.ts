import type { LocationValue } from "@/shared/lib/maps/location.types";

export interface AddressAutocompleteProps {
  value: LocationValue | null;
  onLocationSelect: (value: LocationValue | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  badge?: string;
  badgeAction?: {
    ariaLabel: string;
    onClick: () => void;
  };
  hint?: string;
  className?: string;
}

export interface AddressSuggestionScrollState {
  canScrollDown: boolean;
  canScrollUp: boolean;
}

export type AddressSuggestionOptionRefs = Map<string, HTMLButtonElement>;
