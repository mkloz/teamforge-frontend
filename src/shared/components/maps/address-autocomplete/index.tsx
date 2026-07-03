import { AddressAutocompleteHint } from "@/shared/components/maps/address-autocomplete/address-autocomplete/address-autocomplete-hint";
import { AddressAutocompleteInputShell } from "@/shared/components/maps/address-autocomplete/address-autocomplete/address-autocomplete-input-shell";
import { AddressAutocompleteLabelRow } from "@/shared/components/maps/address-autocomplete/address-autocomplete/address-autocomplete-label-row";
import { getAddressAutocompleteRenderState } from "@/shared/components/maps/address-autocomplete/address-autocomplete/address-autocomplete-render-state";
import { AddressSuggestionsLayer } from "@/shared/components/maps/address-autocomplete/address-autocomplete/address-suggestions-layer";
import { useAddressAutocompleteIds } from "@/shared/components/maps/address-autocomplete/address-autocomplete/use-address-autocomplete-ids";
import type { AddressAutocompleteProps } from "@/shared/components/maps/address-autocomplete/address-autocomplete-types";
import { useAddressSuggestionsPanel } from "@/shared/components/maps/address-autocomplete/use-address-suggestions-panel";
import { useAddressAutocomplete } from "@/shared/hooks/use-address-autocomplete";
import { getBrowserDocumentBody } from "@/shared/lib/browser-environment";
import type { LocationValue } from "@/shared/lib/maps/location.types";
import { cn } from "@/shared/lib/utils";

export type { LocationValue };

export function AddressAutocomplete({
  value,
  onLocationSelect,
  label = "Location",
  placeholder = "Search address, area, or venue...",
  disabled,
  required,
  badge = "City stays public",
  hint = "Exact point is used for matching only. Other members see your city.",
  className,
}: AddressAutocompleteProps) {
  const { hintId, inputId, suggestionsId } = useAddressAutocompleteIds();
  const {
    containerRef,
    inputValue,
    mapsStatus,
    mapsReady,
    suggestions,
    isSuggestionsOpen,
    activeSuggestionIndex,
    isResolvingPlace,
    isLocating,
    message,
    messageTone,
    hasCurrentAreaError,
    setActiveSuggestionIndex,
    handleInputFocus,
    handleInputChange,
    handleInputKeyDown,
    closeSuggestions,
    clearLocation,
    selectPrediction,
    useCurrentArea,
  } = useAddressAutocomplete({ value, onLocationSelect });
  const renderState = getAddressAutocompleteRenderState({
    activeSuggestionIndex,
    hint,
    hintId,
    inputValue,
    isLocating,
    isResolvingPlace,
    isSuggestionsOpen,
    mapsReady,
    mapsStatus,
    message,
    messageTone,
    suggestions,
    suggestionsId,
  });
  const portalTarget = getBrowserDocumentBody();
  const {
    inputShellRef,
    listRef,
    optionRefs,
    panelRef,
    panelStyle,
    scrollState,
    scrollSuggestions,
    updateScrollState,
  } = useAddressSuggestionsPanel({
    activeSuggestionIndex,
    closeSuggestions,
    containerRef,
    isSuggestionsOpen,
    suggestions,
  });

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col gap-2", className)}
    >
      <AddressAutocompleteLabelRow
        badge={badge}
        inputId={inputId}
        label={label}
        required={required}
      />

      <AddressAutocompleteInputShell
        clearLocation={clearLocation}
        disabled={disabled}
        handleInputChange={handleInputChange}
        handleInputFocus={handleInputFocus}
        handleInputKeyDown={handleInputKeyDown}
        hasCurrentAreaError={hasCurrentAreaError}
        hintId={hintId}
        inputId={inputId}
        inputShellRef={inputShellRef}
        inputValue={inputValue}
        isLocating={isLocating}
        isSuggestionsOpen={isSuggestionsOpen}
        mapsReady={mapsReady}
        placeholder={placeholder}
        renderState={renderState}
        required={required}
        suggestionsId={suggestionsId}
        useCurrentArea={useCurrentArea}
      >
        <AddressSuggestionsLayer
          activeSuggestionIndex={activeSuggestionIndex}
          isSuggestionsOpen={isSuggestionsOpen}
          listRef={listRef}
          onActiveSuggestionChange={setActiveSuggestionIndex}
          onPredictionSelect={selectPrediction}
          onScroll={updateScrollState}
          onScrollSuggestions={scrollSuggestions}
          optionRefs={optionRefs}
          panelRef={panelRef}
          panelStyle={panelStyle}
          portalTarget={portalTarget}
          scrollState={scrollState}
          suggestions={suggestions}
          suggestionsId={suggestionsId}
        />
      </AddressAutocompleteInputShell>

      <AddressAutocompleteHint
        hintId={hintId}
        message={message}
        renderState={renderState}
      />
    </div>
  );
}
