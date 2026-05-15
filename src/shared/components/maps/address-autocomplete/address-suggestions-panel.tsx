import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import type { CSSProperties, RefObject } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import type {
  AddressSuggestionOptionRefs,
  AddressSuggestionScrollState,
} from "./address-autocomplete-types";

interface AddressSuggestionsPanelProps {
  activeSuggestionIndex: number;
  listRef: RefObject<HTMLDivElement | null>;
  onActiveSuggestionChange: (index: number) => void;
  onPredictionSelect: (suggestion: GoogleAutocompletePrediction) => void;
  onScroll: () => void;
  onScrollSuggestions: (direction: 1 | -1) => void;
  optionRefs: RefObject<AddressSuggestionOptionRefs>;
  panelRef: RefObject<HTMLDivElement | null>;
  panelStyle: CSSProperties | null;
  portalTarget: HTMLElement | null;
  scrollState: AddressSuggestionScrollState;
  suggestions: GoogleAutocompletePrediction[];
  suggestionsId: string;
}

export function AddressSuggestionsPanel({
  activeSuggestionIndex,
  listRef,
  onActiveSuggestionChange,
  onPredictionSelect,
  onScroll,
  onScrollSuggestions,
  optionRefs,
  panelRef,
  panelStyle,
  portalTarget,
  scrollState,
  suggestions,
  suggestionsId,
}: AddressSuggestionsPanelProps) {
  if (!panelStyle || !portalTarget || suggestions.length === 0) {
    return null;
  }

  return createPortal(
    <div
      ref={panelRef}
      id={suggestionsId}
      role="listbox"
      style={panelStyle}
      className="z-100 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-black/10 shadow-xl"
    >
      <div className="relative overflow-hidden rounded-lg">
        <div
          ref={listRef}
          className="scrollbar-hide -mr-5 flex max-h-(--location-panel-list-height) flex-col gap-0.5 overflow-y-auto py-0 pr-5"
          onScroll={onScroll}
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
                tabIndex={active ? 0 : -1}
                onMouseEnter={() => onActiveSuggestionChange(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onPredictionSelect(suggestion)}
                className={cn(
                  "h-auto w-full justify-start rounded-lg border-0 px-2.5 py-1 text-left font-medium shadow-none transition-colors hover:bg-muted/55 hover:text-ink focus-visible:bg-muted/55 focus-visible:ring-slate-muted/25 active:enabled:translate-y-0 active:enabled:scale-100",
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
                  <span className="block truncate font-semibold text-ink text-sm leading-5">
                    {suggestion.structured_formatting?.main_text ??
                      suggestion.description}
                  </span>
                  {suggestion.structured_formatting?.secondary_text ? (
                    <span className="block truncate font-medium text-micro text-slate-muted leading-4">
                      {suggestion.structured_formatting.secondary_text}
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
          onClick={() => onScrollSuggestions(-1)}
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
          onClick={() => onScrollSuggestions(1)}
        >
          <ChevronDown size={15} />
        </button>
      </div>
    </div>,
    portalTarget,
  );
}
