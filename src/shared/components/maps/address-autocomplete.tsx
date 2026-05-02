import { Loader2, LocateFixed, MapPin, Search, X } from "lucide-react";
import { useId } from "react";

import { Button } from "@/shared/components/ui/button";
import { useAddressAutocomplete } from "@/shared/hooks/use-address-autocomplete";
import type { LocationValue } from "@/shared/lib/maps/location.types";
import { cn } from "@/shared/lib/utils";

export type { LocationValue } from "@/shared/lib/maps/location.types";

interface AddressAutocompleteProps {
  value: LocationValue | null;
  onLocationSelect: (value: LocationValue | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  badge?: string;
  hint?: string;
  className?: string;
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
    clearLocation,
    selectPrediction,
    useCurrentArea,
  } = useAddressAutocomplete({ value, onLocationSelect });
  const showManualHint = mapsStatus === "unavailable";
  const isBusy = mapsStatus === "loading" || isResolvingPlace || isLocating;
  const describedBy = message || showManualHint ? `${inputId}-hint` : undefined;
  const activeSuggestion = suggestions[activeSuggestionIndex];
  const activeSuggestionId =
    isSuggestionsOpen && activeSuggestion
      ? `${suggestionsId}-${activeSuggestion.place_id}`
      : undefined;

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col gap-2", className)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-semibold text-ink">
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </label>
        <span className="rounded-full border border-slate-muted/30 bg-canvas px-2 py-0.5 text-[11px] font-semibold text-ink">
          {badge}
        </span>
      </div>

      <div className="relative">
        <Search
          size={17}
          strokeWidth={1.5}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted"
        />
        <input
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
          className="h-11 w-full rounded-xl border border-slate-muted/35 bg-canvas pl-10 pr-20 text-sm font-medium text-ink outline-none transition-colors placeholder:text-slate-muted focus:border-forge-teal focus:ring-2 focus:ring-forge-teal/25 disabled:cursor-not-allowed disabled:bg-canvas/70 disabled:text-slate-muted"
        />

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {isBusy ? (
            <Loader2
              size={15}
              className="animate-spin text-slate-muted"
              aria-hidden="true"
            />
          ) : null}
          {inputValue ? (
            <button
              type="button"
              onClick={clearLocation}
              disabled={disabled}
              className="inline-flex size-7 items-center justify-center rounded-full text-slate-muted transition-colors hover:bg-forge-teal/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30 disabled:pointer-events-none"
              aria-label="Clear location"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        {isSuggestionsOpen && suggestions.length > 0 ? (
          <div
            id={suggestionsId}
            role="listbox"
            className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-muted/30 bg-canvas p-1 shadow-lg shadow-black/10"
          >
            {suggestions.map((suggestion, index) => {
              const active = index === activeSuggestionIndex;
              const optionId = `${suggestionsId}-${suggestion.place_id}`;

              return (
                <button
                  id={optionId}
                  key={suggestion.place_id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveSuggestionIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectPrediction(suggestion)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-forge-teal/10 focus-visible:bg-forge-teal/10 focus-visible:outline-none",
                    active ? "bg-forge-teal/10" : "",
                  )}
                >
                  <MapPin
                    size={16}
                    strokeWidth={1.5}
                    className="mt-0.5 shrink-0 text-forge-teal"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {suggestion.structured_formatting?.main_text ??
                        suggestion.description}
                    </span>
                    {suggestion.structured_formatting?.secondary_text ? (
                      <span className="block truncate text-xs font-medium text-slate-muted">
                        {suggestion.structured_formatting.secondary_text}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p
          id={`${inputId}-hint`}
          className="text-xs leading-5 text-slate-muted"
        >
          {message ??
            (showManualHint
              ? "Autocomplete is off. Type your city or venue manually."
              : hint)}
        </p>
        {mapsReady ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={useCurrentArea}
            disabled={disabled || isLocating}
            className="h-8 shrink-0 gap-2 px-2 font-semibold text-forge-teal"
          >
            <LocateFixed size={14} />
            Use my area
          </Button>
        ) : null}
      </div>
    </div>
  );
}
