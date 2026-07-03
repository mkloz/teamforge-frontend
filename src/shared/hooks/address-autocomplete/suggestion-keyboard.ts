import type { KeyboardEvent } from "react";
import type {
  SuggestionKeyboardAction,
  SuggestionNavigationDirection,
} from "@/shared/hooks/use-address-autocomplete-state";

interface SuggestionKeyboardHandlerInput {
  closeSuggestions: () => void;
  event: KeyboardEvent<HTMLInputElement>;
  keyboardAction: SuggestionKeyboardAction;
  moveActiveSuggestion: (direction: SuggestionNavigationDirection) => void;
  selectActiveSuggestion: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export function handleSuggestionKeyboardAction({
  closeSuggestions,
  event,
  keyboardAction,
  moveActiveSuggestion,
  selectActiveSuggestion,
}: SuggestionKeyboardHandlerInput) {
  if (keyboardAction.type === "close") {
    closeSuggestions();
    return;
  }

  if (keyboardAction.type === "ignore") {
    return;
  }

  if (keyboardAction.type === "move") {
    event.preventDefault();
    moveActiveSuggestion(keyboardAction.direction);
    return;
  }

  selectActiveSuggestion(event);
}
