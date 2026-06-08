import { Search } from "lucide-react";
import { useId } from "react";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { StatusPill } from "@/shared/components/ui/status-pill";
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
  const hintId = `${inputId}-hint`;
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
  const showManualHint = mapsStatus === "unavailable";
  const isBusy = mapsStatus === "loading" || isResolvingPlace || isLocating;
  const showBusyIndicator = isBusy && !isLocating;
  const hasErrorMessage = messageTone === "error";
  const describedBy = message || showManualHint ? hintId : undefined;
  const hasRightControls = mapsReady || isBusy || Boolean(inputValue);
  const rightPaddingClassName = getAddressInputRightPaddingClassName({
    inputValue,
    mapsReady,
    showBusyIndicator,
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
        <StatusPill
          tone="none"
          size="xs"
          className="border-slate-muted/30 bg-canvas font-semibold text-ink"
        >
          {badge}
        </StatusPill>
      </div>

      <div ref={inputShellRef} className="relative">
        <Input
          id={inputId}
          type="search"
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
          aria-invalid={hasErrorMessage || undefined}
          className={rightPaddingClassName}
          leftIcon={<Search className="size-3.5" strokeWidth={2} />}
          rightIcon={
            hasRightControls ? (
              <AddressInputControls
                disabled={disabled}
                hasCurrentAreaError={hasCurrentAreaError}
                inputValue={inputValue}
                isBusy={isBusy}
                isLocating={isLocating}
                mapsReady={mapsReady}
                messageId={hintId}
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
          id={hintId}
          aria-live={message ? "polite" : undefined}
          role={hasErrorMessage ? "alert" : undefined}
          className={cn(
            "text-slate-muted text-xs leading-5",
            hasErrorMessage && "font-medium text-destructive",
          )}
        >
          {getLocationHintMessage({ hint, message, showManualHint })}
        </p>
      </div>
    </div>
  );
}
