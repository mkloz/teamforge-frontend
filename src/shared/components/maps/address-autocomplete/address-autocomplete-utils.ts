export function getAddressInputRightPaddingClassName({
  inputValue,
  mapsReady,
  showBusyIndicator,
}: {
  inputValue: string;
  mapsReady: boolean;
  showBusyIndicator: boolean;
}) {
  const rightControlCount =
    Number(mapsReady) + Number(showBusyIndicator) + Number(Boolean(inputValue));

  if (rightControlCount >= 3) {
    return "pr-24";
  }

  if (rightControlCount === 2) {
    return "pr-20";
  }

  if (rightControlCount === 1) {
    return "pr-12";
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
  suggestions: GoogleAutocompletePrediction[];
  suggestionsId: string;
}) {
  const activeSuggestion = suggestions[activeSuggestionIndex];

  if (!isSuggestionsOpen || !activeSuggestion) {
    return undefined;
  }

  return `${suggestionsId}-${activeSuggestion.place_id}`;
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
    return "Autocomplete is off. Type your city or venue manually.";
  }

  return hint;
}

export function getEstimatedSuggestionsPanelHeight(suggestionCount: number) {
  return suggestionCount * 37 + 12;
}
