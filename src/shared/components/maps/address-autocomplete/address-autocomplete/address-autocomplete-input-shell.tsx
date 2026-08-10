import { Search } from "lucide-react";
import type {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  ReactNode,
  RefObject,
} from "react";

import type { AddressAutocompleteRenderState } from "@/shared/components/maps/address-autocomplete/address-autocomplete/address-autocomplete-render-state";
import type { AddressAutocompleteProps } from "@/shared/components/maps/address-autocomplete/address-autocomplete-types";
import { AddressInputControls } from "@/shared/components/maps/address-autocomplete/address-input-controls";
import { Input } from "@/shared/components/ui/input";

interface AddressAutocompleteInputShellProps {
  children: ReactNode;
  clearLocation: () => void;
  disabled: AddressAutocompleteProps["disabled"];
  handleInputBlur: FocusEventHandler<HTMLInputElement>;
  handleInputChange: ChangeEventHandler<HTMLInputElement>;
  handleInputFocus: FocusEventHandler<HTMLInputElement>;
  handleInputKeyDown: KeyboardEventHandler<HTMLInputElement>;
  geolocationAvailable: boolean;
  hasCurrentAreaError: boolean;
  hintId: string;
  inputId: string;
  inputShellRef: RefObject<HTMLDivElement | null>;
  inputValue: string;
  isLocating: boolean;
  isSuggestionsOpen: boolean;
  placeholder: string;
  renderState: AddressAutocompleteRenderState;
  required: AddressAutocompleteProps["required"];
  suggestionsId: string;
  useCurrentArea: () => void;
}

export function AddressAutocompleteInputShell({
  children,
  clearLocation,
  disabled,
  handleInputBlur,
  handleInputChange,
  handleInputFocus,
  handleInputKeyDown,
  geolocationAvailable,
  hasCurrentAreaError,
  hintId,
  inputId,
  inputShellRef,
  inputValue,
  isLocating,
  isSuggestionsOpen,
  placeholder,
  renderState,
  required,
  suggestionsId,
  useCurrentArea,
}: AddressAutocompleteInputShellProps) {
  return (
    <div ref={inputShellRef} className="relative">
      <Input
        id={inputId}
        type="search"
        value={inputValue}
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isSuggestionsOpen}
        aria-controls={suggestionsId}
        aria-activedescendant={renderState.activeSuggestionId}
        aria-describedby={renderState.describedBy}
        aria-invalid={renderState.hasErrorMessage || undefined}
        className={renderState.rightPaddingClassName}
        leftIcon={<Search className="size-3.5" strokeWidth={2} />}
        rightIcon={getAddressInputControls({
          clearLocation,
          disabled,
          hasCurrentAreaError,
          hintId,
          inputValue,
          isLocating,
          geolocationAvailable,
          renderState,
          useCurrentArea,
        })}
      />

      {children}
    </div>
  );
}

function getAddressInputControls({
  clearLocation,
  disabled,
  hasCurrentAreaError,
  hintId,
  inputValue,
  isLocating,
  geolocationAvailable,
  renderState,
  useCurrentArea,
}: {
  clearLocation: () => void;
  disabled: AddressAutocompleteProps["disabled"];
  hasCurrentAreaError: boolean;
  hintId: string;
  inputValue: string;
  isLocating: boolean;
  geolocationAvailable: boolean;
  renderState: Pick<
    AddressAutocompleteRenderState,
    "hasRightControls" | "isBusy"
  >;
  useCurrentArea: () => void;
}) {
  if (!renderState.hasRightControls) {
    return null;
  }

  return (
    <AddressInputControls
      disabled={disabled}
      hasCurrentAreaError={hasCurrentAreaError}
      inputValue={inputValue}
      isBusy={renderState.isBusy}
      isLocating={isLocating}
      geolocationAvailable={geolocationAvailable}
      messageId={hintId}
      onClearLocation={clearLocation}
      onUseCurrentArea={useCurrentArea}
    />
  );
}
