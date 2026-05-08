import { Search } from "lucide-react";
import { useId } from "react";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useAddressAutocomplete } from "@/shared/hooks/use-address-autocomplete";
import { getBrowserDocumentBody } from "@/shared/lib/browser-environment";
import type { LocationValue } from "@/shared/lib/maps/location.types";
import { cn } from "@/shared/lib/utils";
import type { AddressAutocompleteProps } from "./address-autocomplete-types";
import {
  getActiveSuggestionId,
  getAddressInputRightPaddingClassName,
  getLocationHintMessage,
} from "./address-autocomplete-utils";
import { AddressInputControls } from "./address-input-controls";
import { AddressSuggestionsPanel } from "./address-suggestions-panel";
import { useAddressSuggestionsPanel } from "./use-address-suggestions-panel";

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
  const inputId = useId();
  const suggestionsId = `${inputId}-suggestions`;
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
    setActiveSuggestionIndex,
    handleInputFocus,
    handleInputChange,
    handleInputKeyDown,
    closeSuggestions,
    clearLocation,
    selectPrediction,
    useCurrentArea,
  } = useAddressAutocomplete({ value, onLocationSelect });
  const showManualHint = mapsStatus === "unavailable";
  const isBusy = mapsStatus === "loading" || isResolvingPlace || isLocating;
  const describedBy = message || showManualHint ? `${inputId}-hint` : undefined;
  const hasRightControls = mapsReady || isBusy || Boolean(inputValue);
  const rightPaddingClassName = getAddressInputRightPaddingClassName({
    inputValue,
    isBusy,
    mapsReady,
  });
  const activeSuggestionId = getActiveSuggestionId({
    activeSuggestionIndex,
    isSuggestionsOpen,
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
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={inputId} className="font-semibold text-ink text-sm">
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </Label>
        <span className="rounded-full border border-slate-muted/30 bg-canvas px-2 py-0.5 font-semibold text-ink text-micro">
          {badge}
        </span>
      </div>

      <div ref={inputShellRef} className="relative">
        <Input
          id={inputId}
          value={inputValue}
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
          aria-activedescendant={activeSuggestionId}
          aria-describedby={describedBy}
          className={rightPaddingClassName}
          leftIcon={<Search size={17} strokeWidth={1.5} />}
          rightIcon={
            hasRightControls ? (
              <AddressInputControls
                disabled={disabled}
                inputValue={inputValue}
                isBusy={isBusy}
                isLocating={isLocating}
                mapsReady={mapsReady}
                onClearLocation={clearLocation}
                onUseCurrentArea={useCurrentArea}
              />
            ) : null
          }
        />

        {isSuggestionsOpen ? (
          <AddressSuggestionsPanel
            activeSuggestionIndex={activeSuggestionIndex}
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
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p
          id={`${inputId}-hint`}
          className="text-slate-muted text-xs leading-5"
        >
          {getLocationHintMessage({ hint, message, showManualHint })}
        </p>
      </div>
    </div>
  );
}
