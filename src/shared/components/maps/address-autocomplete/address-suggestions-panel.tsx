import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import type { CSSProperties, RefObject } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

import type {
  AddressSuggestionOptionRefs,
  AddressSuggestionScrollState,
} from "./address-autocomplete-types";

export interface AddressSuggestionsPanelProps {
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

type AddressSuggestionScrollDirection = 1 | -1;

interface AddressSuggestionRowProps {
  active: boolean;
  index: number;
  onActiveSuggestionChange: (index: number) => void;
  onPredictionSelect: (suggestion: GoogleAutocompletePrediction) => void;
  optionRefs: RefObject<AddressSuggestionOptionRefs>;
  suggestion: GoogleAutocompletePrediction;
  suggestionsId: string;
}

interface AddressSuggestionsPortalState {
  panelStyle: CSSProperties;
  portalTarget: HTMLElement;
}

interface AddressSuggestionScrollButtonProps {
  canScroll: boolean;
  direction: AddressSuggestionScrollDirection;
  onScrollSuggestions: (direction: AddressSuggestionScrollDirection) => void;
}

const ADDRESS_SUGGESTION_SCROLL_UP = {
  Icon: ChevronUp,
  ariaLabel: "Scroll location suggestions up",
  className:
    "absolute inset-x-0 top-0 z-10 flex h-11 items-start justify-center bg-linear-to-b from-card via-card/85 to-transparent pt-1 text-slate-muted transition-all duration-200",
  hiddenClassName: "pointer-events-none -translate-y-1 opacity-0",
} as const;

const ADDRESS_SUGGESTION_SCROLL_DOWN = {
  Icon: ChevronDown,
  ariaLabel: "Scroll location suggestions down",
  className:
    "absolute inset-x-0 bottom-0 z-10 flex h-11 items-end justify-center bg-linear-to-t from-card via-card/85 to-transparent pb-1 text-slate-muted transition-all duration-200",
  hiddenClassName: "pointer-events-none translate-y-1 opacity-0",
} as const;

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
  const portalState = getAddressSuggestionsPortalState({
    panelStyle,
    portalTarget,
    suggestions,
  });

  if (!portalState) {
    return null;
  }

  return createPortal(
    <div
      ref={panelRef}
      id={suggestionsId}
      // react-doctor-disable-next-line react-doctor/prefer-tag-over-role -- This popup is the ARIA combobox listbox controlled by the text input via aria-controls/aria-activedescendant; there is no native HTML listbox element.
      role="listbox"
      style={portalState.panelStyle}
      className="z-100 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-black/10 shadow-xl"
    >
      <div className="relative overflow-hidden rounded-lg">
        <div
          ref={listRef}
          className="scrollbar-hide -mr-5 flex max-h-(--location-panel-list-height) flex-col gap-0.5 overflow-y-auto py-0 pr-5"
          onScroll={onScroll}
        >
          {suggestions.map((suggestion, index) => (
            <AddressSuggestionRow
              active={index === activeSuggestionIndex}
              index={index}
              key={suggestion.place_id}
              onActiveSuggestionChange={onActiveSuggestionChange}
              onPredictionSelect={onPredictionSelect}
              optionRefs={optionRefs}
              suggestion={suggestion}
              suggestionsId={suggestionsId}
            />
          ))}
        </div>

        <AddressSuggestionScrollButton
          canScroll={scrollState.canScrollUp}
          direction={-1}
          onScrollSuggestions={onScrollSuggestions}
        />
        <AddressSuggestionScrollButton
          canScroll={scrollState.canScrollDown}
          direction={1}
          onScrollSuggestions={onScrollSuggestions}
        />
      </div>
    </div>,
    portalState.portalTarget,
  );
}

function getAddressSuggestionsPortalState({
  panelStyle,
  portalTarget,
  suggestions,
}: Pick<
  AddressSuggestionsPanelProps,
  "panelStyle" | "portalTarget" | "suggestions"
>): AddressSuggestionsPortalState | null {
  if (!panelStyle || !portalTarget || suggestions.length === 0) {
    return null;
  }

  return { panelStyle, portalTarget };
}

function AddressSuggestionRow({
  active,
  index,
  onActiveSuggestionChange,
  onPredictionSelect,
  optionRefs,
  suggestion,
  suggestionsId,
}: AddressSuggestionRowProps) {
  return (
    <Button
      id={getSuggestionOptionId(suggestionsId, suggestion)}
      ref={(node) => {
        syncSuggestionOptionRef(optionRefs, suggestion.place_id, node);
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
      <AddressSuggestionIcon active={active} />
      <AddressSuggestionText suggestion={suggestion} />
    </Button>
  );
}

function AddressSuggestionIcon({ active }: { active: boolean }) {
  return (
    <IconTile
      icon={MapPin}
      tone="teal"
      size="sm"
      shape="square"
      className={cn(
        "mt-0.5 size-6 bg-forge-teal/8",
        active && "bg-forge-teal/12",
      )}
      iconClassName="size-3.25"
    />
  );
}

function AddressSuggestionText({
  suggestion,
}: {
  suggestion: GoogleAutocompletePrediction;
}) {
  const secondaryText = suggestion.structured_formatting?.secondary_text;

  return (
    <span className="min-w-0">
      <span className="block truncate font-semibold text-ink text-sm leading-5">
        {getSuggestionMainText(suggestion)}
      </span>
      {secondaryText ? (
        <span className="block truncate font-medium text-slate-muted text-xs leading-4">
          {secondaryText}
        </span>
      ) : null}
    </span>
  );
}

function AddressSuggestionScrollButton({
  canScroll,
  direction,
  onScrollSuggestions,
}: AddressSuggestionScrollButtonProps) {
  const { Icon, ariaLabel, className, hiddenClassName } =
    getAddressSuggestionScrollButtonConfig(direction);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={!canScroll}
      className={cn(
        className,
        getAddressSuggestionScrollButtonStateClass(canScroll, hiddenClassName),
      )}
      onClick={() => onScrollSuggestions(direction)}
    >
      <Icon size={15} />
    </button>
  );
}

function getAddressSuggestionScrollButtonConfig(
  direction: AddressSuggestionScrollDirection,
) {
  return direction === -1
    ? ADDRESS_SUGGESTION_SCROLL_UP
    : ADDRESS_SUGGESTION_SCROLL_DOWN;
}

function getAddressSuggestionScrollButtonStateClass(
  canScroll: boolean,
  hiddenClassName: string,
) {
  return canScroll ? "opacity-100" : hiddenClassName;
}

function getSuggestionOptionId(
  suggestionsId: string,
  suggestion: GoogleAutocompletePrediction,
) {
  return `${suggestionsId}-${suggestion.place_id}`;
}

function getSuggestionMainText(suggestion: GoogleAutocompletePrediction) {
  return suggestion.structured_formatting?.main_text ?? suggestion.description;
}

function syncSuggestionOptionRef(
  optionRefs: RefObject<AddressSuggestionOptionRefs>,
  placeId: string,
  node: HTMLButtonElement | null,
) {
  if (node) {
    optionRefs.current.set(placeId, node);
    return;
  }

  optionRefs.current.delete(placeId);
}
