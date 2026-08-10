import { isBrowserSecureContext } from "@/shared/lib/browser-environment";
import type {
  Coordinates,
  LocationValue,
} from "@/shared/lib/maps/location.types";

export type AddressAutocompleteMessageTone = "error" | "info";
export type SuggestionNavigationDirection = "next" | "previous";

export interface AddressAutocompleteMessage {
  text: string;
  tone: AddressAutocompleteMessageTone;
}

export interface AddressAutocompleteDraftInput {
  baseValue: string;
  value: string;
}

export interface AddressAutocompleteMessageOutput {
  message: string | null;
  messageTone: AddressAutocompleteMessageTone | null;
}

interface AddressAutocompleteInputState {
  draftInput: AddressAutocompleteDraftInput | null;
  externalInputValue: string;
}

interface PredictionRequestState {
  hasSkippedValue: boolean;
  hasTypedInSession: boolean;
  inputValue: string;
  isSettledResolvedValue: boolean;
  mapsReady: boolean;
}

interface SuggestionKeyboardActionInput {
  activeSuggestionIndex: number;
  canUseSuggestions: boolean;
  isSuggestionsOpen: boolean;
  key: string;
}

export type PredictionRequestDecision = "clear" | "idle" | "request";
export type SuggestionKeyboardAction =
  | { type: "close" }
  | { direction: SuggestionNavigationDirection; type: "move" }
  | { type: "select-active" }
  | { type: "ignore" };

const AUTOCOMPLETE_QUERY_MIN_LENGTH = 3;
export const CURRENT_AREA_LABEL = "Current area";
const CURRENT_AREA_ERROR_MESSAGES = {
  permissionDenied:
    "Location is blocked for this site. Check browser permissions or search manually.",
  positionUnavailable:
    "Your browser couldn't get a location fix. Try again or search manually.",
  secureContextRequired:
    "Current location needs HTTPS or a trusted localhost URL.",
  timeout: "Location lookup timed out. Try again or search manually.",
  unavailable: "We couldn't get your location. Try again or search manually.",
} as const;
const CLOSE_SUGGESTION_KEYBOARD_ACTION: SuggestionKeyboardAction = {
  type: "close",
};
const IGNORE_SUGGESTION_KEYBOARD_ACTION: SuggestionKeyboardAction = {
  type: "ignore",
};
const SELECT_ACTIVE_SUGGESTION_KEYBOARD_ACTION: SuggestionKeyboardAction = {
  type: "select-active",
};
const SUGGESTION_MOVE_KEYBOARD_ACTIONS = {
  next: { direction: "next", type: "move" },
  previous: { direction: "previous", type: "move" },
} satisfies Record<SuggestionNavigationDirection, SuggestionKeyboardAction>;
type SuggestionKeyboardActionResolver = (
  input: SuggestionKeyboardActionInput,
) => SuggestionKeyboardAction;

function isGeolocationPositionError(
  error: unknown,
): error is GeolocationPositionError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "number"
  );
}

function hasResolvedLocationIdentity(value: LocationValue | null) {
  return Boolean(value?.placeId) || hasResolvedCoordinates(value);
}

function hasResolvedCoordinates(value: LocationValue | null) {
  return value?.lat != null || value?.lng != null;
}

function hasPredictionRequestInputs({
  hasTypedInSession,
  inputValue,
  mapsReady,
}: PredictionRequestState) {
  return (
    mapsReady && hasTypedInSession && hasSearchableAutocompleteInput(inputValue)
  );
}

function hasPredictionRequestBlocker({
  hasSkippedValue,
  isSettledResolvedValue,
}: PredictionRequestState) {
  return isSettledResolvedValue || hasSkippedValue;
}

function shouldRequestPredictions(state: PredictionRequestState) {
  return (
    hasPredictionRequestInputs(state) && !hasPredictionRequestBlocker(state)
  );
}

function canSelectActiveSuggestion({
  activeSuggestionIndex,
  isSuggestionsOpen,
  key,
}: Pick<
  SuggestionKeyboardActionInput,
  "activeSuggestionIndex" | "isSuggestionsOpen" | "key"
>) {
  return key === "Enter" && isSuggestionsOpen && activeSuggestionIndex >= 0;
}

function getCurrentAreaPositionErrorMessage(error: GeolocationPositionError) {
  const messageByErrorCode: Partial<Record<number, string>> = {
    [error.PERMISSION_DENIED]: CURRENT_AREA_ERROR_MESSAGES.permissionDenied,
    [error.POSITION_UNAVAILABLE]:
      CURRENT_AREA_ERROR_MESSAGES.positionUnavailable,
    [error.TIMEOUT]: CURRENT_AREA_ERROR_MESSAGES.timeout,
  };

  return (
    messageByErrorCode[error.code] ?? CURRENT_AREA_ERROR_MESSAGES.unavailable
  );
}

function getSuggestionMoveKeyboardAction(
  direction: SuggestionNavigationDirection,
): SuggestionKeyboardActionResolver {
  return ({ canUseSuggestions }) =>
    canUseSuggestions
      ? SUGGESTION_MOVE_KEYBOARD_ACTIONS[direction]
      : IGNORE_SUGGESTION_KEYBOARD_ACTION;
}

function getSelectActiveSuggestionKeyboardAction(
  input: SuggestionKeyboardActionInput,
) {
  if (!input.canUseSuggestions || !canSelectActiveSuggestion(input)) {
    return IGNORE_SUGGESTION_KEYBOARD_ACTION;
  }

  return SELECT_ACTIVE_SUGGESTION_KEYBOARD_ACTION;
}

const SUGGESTION_KEYBOARD_ACTION_RESOLVERS: Partial<
  Record<string, SuggestionKeyboardActionResolver>
> = {
  ArrowDown: getSuggestionMoveKeyboardAction("next"),
  ArrowUp: getSuggestionMoveKeyboardAction("previous"),
  Enter: getSelectActiveSuggestionKeyboardAction,
  Escape: () => CLOSE_SUGGESTION_KEYBOARD_ACTION,
  Tab: () => CLOSE_SUGGESTION_KEYBOARD_ACTION,
};

export function getCurrentAreaErrorMessage(error: unknown) {
  if (!isBrowserSecureContext()) {
    return CURRENT_AREA_ERROR_MESSAGES.secureContextRequired;
  }

  if (!isGeolocationPositionError(error)) {
    return CURRENT_AREA_ERROR_MESSAGES.unavailable;
  }

  return getCurrentAreaPositionErrorMessage(error);
}

function hasSearchableAutocompleteInput(inputValue: string) {
  return inputValue.trim().length >= AUTOCOMPLETE_QUERY_MIN_LENGTH;
}

export function getVisibleAutocompleteSuggestions(
  mapsReady: boolean,
  inputValue: string,
  suggestions: import("@/shared/lib/maps/location.types").GooglePlaceSuggestion[],
) {
  return mapsReady && hasSearchableAutocompleteInput(inputValue)
    ? suggestions
    : [];
}

export function canUseAutocompleteSuggestions(
  visibleSuggestionsCount: number,
  hasTypedInSession: boolean,
) {
  return visibleSuggestionsCount > 0 && hasTypedInSession;
}

export function createAddressAutocompleteDraftInput(
  baseValue: string,
  value: string,
): AddressAutocompleteDraftInput {
  return {
    baseValue,
    value,
  };
}

function createManualLocationValue(inputValue: string): LocationValue {
  return {
    address: inputValue,
    city: inputValue,
    lat: null,
    lng: null,
    placeId: null,
  };
}

export function createCurrentAreaLocation(
  coordinates: Coordinates,
  currentLocation: LocationValue | null = null,
): LocationValue {
  return {
    address: currentLocation?.address || CURRENT_AREA_LABEL,
    city:
      currentLocation?.city || currentLocation?.address || CURRENT_AREA_LABEL,
    lat: coordinates.lat,
    lng: coordinates.lng,
    placeId: null,
  };
}

export function getExternalAddressInputValue(value: LocationValue | null) {
  return value?.address ?? "";
}

export function getAddressAutocompleteInputValue({
  draftInput,
  externalInputValue,
}: AddressAutocompleteInputState) {
  if (draftInput?.baseValue === externalInputValue) {
    return draftInput.value;
  }

  return externalInputValue;
}

export function getManualAddressInputChange(
  nextValue: string,
  externalInputValue: string,
) {
  return {
    draftInput: createAddressAutocompleteDraftInput(
      externalInputValue,
      nextValue,
    ),
    hasSearchableInput: hasSearchableAutocompleteInput(nextValue),
    locationValue: createManualLocationValue(nextValue),
  };
}

export function getAddressAutocompleteMessageOutput(
  message: AddressAutocompleteMessage | null,
): AddressAutocompleteMessageOutput {
  if (!message) {
    return {
      message: null,
      messageTone: null,
    };
  }

  return {
    message: message.text,
    messageTone: message.tone,
  };
}

export function isResolvedLocationSettled(
  value: LocationValue | null,
  inputValue: string,
) {
  if (!value?.address) {
    return false;
  }

  if (inputValue !== value.address) {
    return false;
  }

  return hasResolvedLocationIdentity(value);
}

export function getPredictionRequestDecision(
  state: PredictionRequestState,
): PredictionRequestDecision {
  if (shouldRequestPredictions(state)) {
    return "request";
  }

  if (hasPredictionRequestBlocker(state)) {
    return "clear";
  }

  return "idle";
}

export function getActiveSuggestionIndexForVisibleState(
  currentIndex: number,
  isSuggestionsOpen: boolean,
  visibleSuggestionsCount: number,
) {
  if (!isSuggestionsOpen || visibleSuggestionsCount === 0) {
    return -1;
  }

  return Math.min(currentIndex, visibleSuggestionsCount - 1);
}

export function getWrappedSuggestionIndex(
  currentIndex: number,
  visibleSuggestionsCount: number,
  direction: SuggestionNavigationDirection,
) {
  if (direction === "next") {
    return currentIndex < visibleSuggestionsCount - 1 ? currentIndex + 1 : 0;
  }

  return currentIndex > 0 ? currentIndex - 1 : visibleSuggestionsCount - 1;
}

export function getSuggestionKeyboardAction(
  input: SuggestionKeyboardActionInput,
): SuggestionKeyboardAction {
  return (
    SUGGESTION_KEYBOARD_ACTION_RESOLVERS[input.key]?.(input) ??
    IGNORE_SUGGESTION_KEYBOARD_ACTION
  );
}
