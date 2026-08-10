import type { GooglePlaceSuggestion } from "@/shared/lib/maps/location.types";

export function getAddressInputRightPaddingClassName({
  inputValue,
  showLocateControl,
  showBusyIndicator,
}: {
  inputValue: string;
  showLocateControl: boolean;
  showBusyIndicator: boolean;
}) {
  const rightControlCount =
    Number(showLocateControl) +
    Number(showBusyIndicator) +
    Number(Boolean(inputValue));

  if (rightControlCount >= 3) {
    return "pr-22";
  }

  if (rightControlCount === 2) {
    return "pr-18";
  }

  if (rightControlCount === 1) {
    return "pr-10";
  }

  return undefined;
}

export function getActiveSuggestionId({
  activeSuggestionIndex,
  isSuggestionsOpen,
  suggestions,
  suggestionsId,
}: {
  activeSuggestionIndex: number;
  isSuggestionsOpen: boolean;
  suggestions: GooglePlaceSuggestion[];
  suggestionsId: string;
}) {
  const activeSuggestion = suggestions[activeSuggestionIndex];

  if (!isSuggestionsOpen || !activeSuggestion) {
    return undefined;
  }

  return `${suggestionsId}-${activeSuggestion.id}`;
}

export function getLocationHintMessage({
  hint,
  message,
  showManualHint,
}: {
  hint: string;
  message: string | null;
  showManualHint: boolean;
}) {
  if (message) {
    return message;
  }

  if (showManualHint) {
    return "Suggestions are off. Type a city or venue manually, or use your location to attach private coordinates.";
  }

  return hint;
}

export function getEstimatedSuggestionsPanelHeight(suggestionCount: number) {
  return suggestionCount * 37 + 40;
}
