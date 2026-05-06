import {
  ChevronDown,
  ChevronUp,
  Loader2,
  LocateFixed,
  MapPin,
  Search,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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

function getPanelPosition(
  anchor: HTMLElement,
  estimatedContentHeight: number,
): CSSProperties {
  const rect = anchor.getBoundingClientRect();
  const gap = 8;
  const viewportPadding = 8;
  const availableWidth = window.innerWidth - viewportPadding * 2;
  const resolvedWidth = Math.min(availableWidth, Math.max(280, rect.width));
  const preferredPanelHeight = 320;
  const preferredMinimumBelow = 180;
  const availableBelow =
    window.innerHeight - rect.bottom - gap - viewportPadding;
  const availableAbove = rect.top - gap - viewportPadding;
  const shouldOpenBelow =
    availableBelow >= preferredMinimumBelow || availableBelow >= availableAbove;
  const availableHeight = shouldOpenBelow ? availableBelow : availableAbove;
  const panelHeight = Math.max(
    72,
    Math.min(preferredPanelHeight, availableHeight, estimatedContentHeight),
  );
  const left = Math.min(
    Math.max(viewportPadding, rect.left),
    window.innerWidth - resolvedWidth - viewportPadding,
  );
  const top = shouldOpenBelow
    ? rect.bottom + gap
    : Math.max(viewportPadding, rect.top - panelHeight - gap);

  return {
    "--location-panel-list-height": `${Math.max(48, panelHeight - 12)}px`,
    left,
    maxHeight: panelHeight,
    position: "fixed",
    top,
    width: resolvedWidth,
  } as CSSProperties;
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
  const inputShellRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef(new Map<string, HTMLButtonElement>());
  const [panelStyle, setPanelStyle] = useState<CSSProperties | null>(null);
  const [scrollState, setScrollState] = useState({
    canScrollDown: false,
    canScrollUp: false,
  });
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
  const rightControlCount =
    Number(mapsReady) + Number(isBusy) + Number(Boolean(inputValue));
  const rightPaddingClassName =
    rightControlCount >= 3
      ? "pr-24"
      : rightControlCount === 2
        ? "pr-20"
        : rightControlCount === 1
          ? "pr-12"
          : undefined;
  const activeSuggestion = suggestions[activeSuggestionIndex];
  const activeSuggestionId =
    isSuggestionsOpen && activeSuggestion
      ? `${suggestionsId}-${activeSuggestion.place_id}`
      : undefined;

  const updatePanelPosition = useCallback(() => {
    if (!inputShellRef.current) {
      return;
    }

    const estimatedContentHeight = suggestions.length * 37 + 12;

    setPanelStyle(
      getPanelPosition(inputShellRef.current, estimatedContentHeight),
    );
  }, [suggestions.length]);

  const updateScrollState = useCallback(() => {
    const node = listRef.current;

    if (!node) {
      return;
    }

    const maxScrollTop = node.scrollHeight - node.clientHeight;

    setScrollState({
      canScrollDown: node.scrollTop < maxScrollTop - 2,
      canScrollUp: node.scrollTop > 2,
    });
  }, []);

  const scrollSuggestions = (direction: 1 | -1) => {
    listRef.current?.scrollBy({
      behavior: "smooth",
      top: direction * 96,
    });
  };

  useEffect(() => {
    if (!isSuggestionsOpen || suggestions.length === 0) {
      return;
    }

    updatePanelPosition();

    window.setTimeout(() => {
      updateScrollState();
    }, 0);
  }, [
    isSuggestionsOpen,
    suggestions.length,
    updatePanelPosition,
    updateScrollState,
  ]);

  useEffect(() => {
    if (!isSuggestionsOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        containerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }

      closeSuggestions();
    };

    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [closeSuggestions, containerRef, isSuggestionsOpen, updatePanelPosition]);

  useEffect(() => {
    if (!isSuggestionsOpen || activeSuggestionIndex < 0) {
      return;
    }

    const suggestion = suggestions[activeSuggestionIndex];

    if (!suggestion) {
      return;
    }

    optionRefs.current.get(suggestion.place_id)?.scrollIntoView({
      block: "nearest",
    });
    window.setTimeout(updateScrollState, 0);
  }, [
    activeSuggestionIndex,
    isSuggestionsOpen,
    suggestions,
    updateScrollState,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col gap-2", className)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={inputId} className="text-sm font-semibold text-ink">
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </Label>
        <span className="rounded-full border border-slate-muted/30 bg-canvas px-2 py-0.5 text-[11px] font-semibold text-ink">
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
              <div className="flex items-center gap-1">
                {mapsReady ? (
                  <Button
                    type="button"
                    variant="accentGhost"
                    size="icon-xs"
                    onClick={useCurrentArea}
                    disabled={disabled || isLocating}
                    className="size-7 rounded-full"
                    aria-label="Use my current area"
                  >
                    <LocateFixed size={14} />
                  </Button>
                ) : null}
                {isBusy ? (
                  <Loader2
                    size={15}
                    className="animate-spin text-slate-muted"
                    aria-hidden="true"
                  />
                ) : null}
                {inputValue ? (
                  <Button
                    type="button"
                    variant="accentGhost"
                    size="icon-xs"
                    onClick={clearLocation}
                    disabled={disabled}
                    className="size-7 rounded-full"
                    aria-label="Clear location"
                  >
                    <X size={14} />
                  </Button>
                ) : null}
              </div>
            ) : null
          }
        />

        {isSuggestionsOpen &&
        suggestions.length > 0 &&
        panelStyle &&
        typeof document !== "undefined"
          ? createPortal(
              <div
                ref={panelRef}
                id={suggestionsId}
                role="listbox"
                style={panelStyle}
                className="z-100 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl shadow-black/10"
              >
                <div className="relative overflow-hidden rounded-lg">
                  <div
                    ref={listRef}
                    style={{ scrollbarWidth: "none" }}
                    className="scrollbar-hide -mr-5 max-h-(--location-panel-list-height) space-y-0.5 overflow-y-auto py-0 pr-5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden! [&::-webkit-scrollbar]:w-0! [&::-webkit-scrollbar-thumb]:hidden! [&::-webkit-scrollbar-track]:hidden!"
                    onScroll={updateScrollState}
                  >
                    {suggestions.map((suggestion, index) => {
                      const active = index === activeSuggestionIndex;
                      const optionId = `${suggestionsId}-${suggestion.place_id}`;

                      return (
                        <Button
                          id={optionId}
                          key={suggestion.place_id}
                          ref={(node) => {
                            if (node) {
                              optionRefs.current.set(suggestion.place_id, node);
                            } else {
                              optionRefs.current.delete(suggestion.place_id);
                            }
                          }}
                          type="button"
                          variant="ghost"
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setActiveSuggestionIndex(index)}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectPrediction(suggestion)}
                          className={cn(
                            "h-auto w-full justify-start rounded-lg border-0 px-2.5 py-1 text-left font-medium shadow-none transition-colors hover:bg-muted/55 hover:text-ink focus-visible:bg-muted/55 focus-visible:ring-slate-muted/25 active:enabled:translate-y-0 enabled:active:scale-100",
                            active && "bg-muted/65 text-ink",
                          )}
                          contentClassName="items-start justify-start"
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-forge-teal/8 text-forge-teal",
                              active && "bg-forge-teal/12",
                            )}
                          >
                            <MapPin size={13} strokeWidth={1.9} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-semibold leading-5 text-ink">
                              {suggestion.structured_formatting?.main_text ??
                                suggestion.description}
                            </span>
                            {suggestion.structured_formatting
                              ?.secondary_text ? (
                              <span className="block truncate text-[11px] font-medium leading-4 text-slate-muted">
                                {
                                  suggestion.structured_formatting
                                    .secondary_text
                                }
                              </span>
                            ) : null}
                          </span>
                        </Button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    aria-label="Scroll location suggestions up"
                    disabled={!scrollState.canScrollUp}
                    className={cn(
                      "absolute inset-x-0 top-0 z-10 flex h-11 items-start justify-center bg-linear-to-b from-card via-card/85 to-transparent pt-1 text-slate-muted transition-all duration-200",
                      scrollState.canScrollUp
                        ? "opacity-100"
                        : "pointer-events-none -translate-y-1 opacity-0",
                    )}
                    onClick={() => scrollSuggestions(-1)}
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll location suggestions down"
                    disabled={!scrollState.canScrollDown}
                    className={cn(
                      "absolute inset-x-0 bottom-0 z-10 flex h-11 items-end justify-center bg-linear-to-t from-card via-card/85 to-transparent pb-1 text-slate-muted transition-all duration-200",
                      scrollState.canScrollDown
                        ? "opacity-100"
                        : "pointer-events-none translate-y-1 opacity-0",
                    )}
                    onClick={() => scrollSuggestions(1)}
                  >
                    <ChevronDown size={15} />
                  </button>
                </div>
              </div>,
              document.body,
            )
          : null}
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
      </div>
    </div>
  );
}
