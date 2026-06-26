import { Search } from "lucide-react";
import { useId } from "react";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { useAddressAutocomplete } from "@/shared/hooks/use-address-autocomplete";
import type { AddressAutocompleteMessageTone } from "@/shared/hooks/use-address-autocomplete-state";
import { getBrowserDocumentBody } from "@/shared/lib/browser-environment";
import type {
  GoogleMapsStatus,
  LocationValue,
} from "@/shared/lib/maps/location.types";
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

interface AddressAutocompleteRenderStateInput {
  activeSuggestionIndex: number;
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
  suggestions: GoogleAutocompletePrediction[];
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
  mapsReady,
}: Pick<AddressAutocompleteRenderStateInput, "inputValue" | "mapsReady"> & {
  isBusy: boolean;
}) {
  return mapsReady || isBusy || Boolean(inputValue);
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

function getAddressAutocompleteRenderState(
  input: AddressAutocompleteRenderStateInput,
) {
  const showManualHint = input.mapsStatus === "unavailable";
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
      mapsReady: input.mapsReady,
    }),
    hintMessage: getLocationHintMessage({
      hint: input.hint,
      message: input.message,
      showManualHint,
    }),
    isBusy,
    rightPaddingClassName: getAddressInputRightPaddingClassName({
      inputValue: input.inputValue,
      mapsReady: input.mapsReady,
      showBusyIndicator,
    }),
  };
}

type AddressAutocompleteRenderState = ReturnType<
  typeof getAddressAutocompleteRenderState
>;

function AddressAutocompleteLabelRow({
  badge,
  inputId,
  label,
  required,
}: Pick<AddressAutocompleteProps, "badge" | "label" | "required"> & {
  inputId: string;
}) {
  return (
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
  );
}

function getAddressInputControls({
  clearLocation,
  disabled,
  hasCurrentAreaError,
  hintId,
  inputValue,
  isLocating,
  mapsReady,
  renderState,
  useCurrentArea,
}: {
  clearLocation: () => void;
  disabled: AddressAutocompleteProps["disabled"];
  hasCurrentAreaError: boolean;
  hintId: string;
  inputValue: string;
  isLocating: boolean;
  mapsReady: boolean;
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
      mapsReady={mapsReady}
      messageId={hintId}
      onClearLocation={clearLocation}
      onUseCurrentArea={useCurrentArea}
    />
  );
}

function AddressAutocompleteHint({
  hintId,
  message,
  renderState,
}: {
  hintId: string;
  message: string | null;
  renderState: Pick<
    AddressAutocompleteRenderState,
    "hasErrorMessage" | "hintMessage"
  >;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p
        id={hintId}
        aria-live={message ? "polite" : undefined}
        role={renderState.hasErrorMessage ? "alert" : undefined}
        className={cn(
          "text-slate-muted text-xs leading-5",
          renderState.hasErrorMessage && "font-medium text-destructive",
        )}
      >
        {renderState.hintMessage}
      </p>
    </div>
  );
}

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
            mapsReady,
            renderState,
            useCurrentArea,
          })}
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

      <AddressAutocompleteHint
        hintId={hintId}
        message={message}
        renderState={renderState}
      />
    </div>
  );
}
