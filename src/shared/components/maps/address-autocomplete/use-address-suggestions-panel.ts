import {
  type CSSProperties,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useFloatingPanelInteractions } from "@/shared/hooks/use-floating-panel-interactions";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";
import {
  scrollElementBy,
  scrollElementIntoView,
} from "@/shared/lib/browser-scroll";
import { getAnchoredScrollablePanelPosition } from "@/shared/lib/floating-panel-position";
import type { GooglePlaceSuggestion } from "@/shared/lib/maps/location.types";
import { getEstimatedSuggestionsPanelHeight } from "./address-autocomplete-utils";

interface UseAddressSuggestionsPanelOptions {
  activeSuggestionIndex: number;
  closeSuggestions: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  isSuggestionsOpen: boolean;
  suggestions: GooglePlaceSuggestion[];
}

export function useAddressSuggestionsPanel({
  activeSuggestionIndex,
  closeSuggestions,
  containerRef,
  isSuggestionsOpen,
  suggestions,
}: UseAddressSuggestionsPanelOptions) {
  const inputShellRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef(new Map<string, HTMLButtonElement>());
  const [panelStyle, setPanelStyle] = useState<CSSProperties | null>(null);
  const [scrollState, setScrollState] = useState({
    canScrollDown: false,
    canScrollUp: false,
  });

  const updatePanelPosition = useCallback(() => {
    if (!inputShellRef.current) {
      return;
    }

    setPanelStyle(
      getAnchoredScrollablePanelPosition(inputShellRef.current, {
        estimatedContentHeight: getEstimatedSuggestionsPanelHeight(
          suggestions.length,
        ),
        listHeightProperty: "--location-panel-list-height",
        panelWidth: 280,
        preferredPanelHeight: 320,
      }),
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

  function scrollSuggestions(direction: 1 | -1) {
    scrollElementBy(listRef.current, {
      intent: "locate",
      top: direction * 96,
    });
  }

  useEffect(() => {
    if (!isSuggestionsOpen || suggestions.length === 0) {
      return undefined;
    }

    updatePanelPosition();

    const delay = scheduleDelay(updateScrollState, 0);

    return () => {
      cancelDelay(delay);
    };
  }, [
    isSuggestionsOpen,
    suggestions.length,
    updatePanelPosition,
    updateScrollState,
  ]);

  useFloatingPanelInteractions({
    enabled: isSuggestionsOpen,
    onDismiss: closeSuggestions,
    onReposition: updatePanelPosition,
    panelRef,
    triggerRef: containerRef,
  });

  useEffect(() => {
    if (!isSuggestionsOpen || activeSuggestionIndex < 0) {
      return undefined;
    }

    const suggestion = suggestions[activeSuggestionIndex];

    if (!suggestion) {
      return undefined;
    }

    scrollElementIntoView(optionRefs.current.get(suggestion.id) ?? null, {
      block: "nearest",
      intent: "reveal",
    });

    const delay = scheduleDelay(updateScrollState, 0);

    return () => {
      cancelDelay(delay);
    };
  }, [
    activeSuggestionIndex,
    isSuggestionsOpen,
    suggestions,
    updateScrollState,
  ]);

  return {
    inputShellRef,
    listRef,
    optionRefs,
    panelRef,
    panelStyle,
    scrollState,
    scrollSuggestions,
    updateScrollState,
  };
}
