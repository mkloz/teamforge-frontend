import type {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  SetStateAction,
} from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  AddressAutocompleteDraftInput,
  AddressAutocompleteMessage,
  AddressAutocompleteMessageTone,
  SuggestionKeyboardAction,
  SuggestionNavigationDirection,
} from "@/shared/hooks/use-address-autocomplete-state";
import {
  CURRENT_AREA_LABEL,
  canUseAutocompleteSuggestions,
  canUseCurrentAreaLookup,
  createAddressAutocompleteDraftInput,
  createCurrentAreaLocation,
  createResolvedCurrentAreaLocation,
  getActiveSuggestionIndexForVisibleState,
  getAddressAutocompleteInputValue,
  getAddressAutocompleteMessageOutput,
  getCurrentAreaErrorMessage,
  getExternalAddressInputValue,
  getManualAddressInputChange,
  getPredictionRequestDecision,
  getSuggestionKeyboardAction,
  getVisibleAutocompleteSuggestions,
  getWrappedSuggestionIndex,
  isResolvedLocationSettled,
} from "@/shared/hooks/use-address-autocomplete-state";
import { useGoogleMapsStatus } from "@/shared/hooks/use-google-maps-status";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";
import {
  getCurrentCoordinates,
  isGeolocationAvailable,
} from "@/shared/lib/maps/browser-geolocation";
import {
  getPlacePredictions,
  resolvePlacePrediction,
  reverseGeocodeCoordinates,
} from "@/shared/lib/maps/google-places-service";
import type {
  Coordinates,
  LocationValue,
} from "@/shared/lib/maps/location.types";

interface UseAddressAutocompleteOptions {
  value: LocationValue | null;
  onLocationSelect: (value: LocationValue | null) => void;
}

type MutableValueRef<T> = {
  current: T;
};

interface UseAutocompleteSuggestionsInput {
  hasTypedInSessionRef: MutableValueRef<boolean>;
  inputValue: string;
  isSettledResolvedValue: boolean;
  mapsReady: boolean;
  skipPredictionsForValueRef: MutableValueRef<string | null>;
}

interface RefreshAutocompletePredictionsInput {
  hasTypedInSessionRef: MutableValueRef<boolean>;
  inputValue: string;
  isActive: () => boolean;
  resetSuggestions: () => void;
  setActiveSuggestionIndex: Dispatch<SetStateAction<number>>;
  setIsSuggestionsOpen: Dispatch<SetStateAction<boolean>>;
  setSuggestions: Dispatch<SetStateAction<GoogleAutocompletePrediction[]>>;
  skipPredictionsForValueRef: MutableValueRef<string | null>;
}

interface SuggestionKeyboardHandlerInput {
  closeSuggestions: () => void;
  event: KeyboardEvent<HTMLInputElement>;
  keyboardAction: SuggestionKeyboardAction;
  moveActiveSuggestion: (direction: SuggestionNavigationDirection) => void;
  selectActiveSuggestion: (event: KeyboardEvent<HTMLInputElement>) => void;
}

interface CurrentAreaLookupResult {
  coordinates: Coordinates;
  nextLocation: LocationValue | null;
}

interface UsePredictionSelectionInput {
  clearMessage: () => void;
  closeSuggestions: () => void;
  externalInputValue: string;
  hasTypedInSessionRef: MutableValueRef<boolean>;
  mapsReady: boolean;
  onLocationSelect: (value: LocationValue) => void;
  resetSuggestions: () => void;
  setDraftInput: Dispatch<SetStateAction<AddressAutocompleteDraftInput | null>>;
  setHasCurrentAreaError: Dispatch<SetStateAction<boolean>>;
  showMessage: (text: string, tone: AddressAutocompleteMessageTone) => void;
  skipPredictionsForValueRef: MutableValueRef<string | null>;
}

interface UseCurrentAreaSelectionInput {
  clearMessage: () => void;
  hasTypedInSessionRef: MutableValueRef<boolean>;
  mapsReady: boolean;
  onLocationSelect: (value: LocationValue) => void;
  requestGoogleMaps: RequestGoogleMaps;
  resetSuggestions: () => void;
  setDraftInput: Dispatch<SetStateAction<AddressAutocompleteDraftInput | null>>;
  setHasCurrentAreaError: Dispatch<SetStateAction<boolean>>;
  showMessage: (text: string, tone: AddressAutocompleteMessageTone) => void;
  skipPredictionsForValueRef: MutableValueRef<string | null>;
}

type RequestGoogleMaps = () => Promise<boolean>;

async function fetchAutocompletePredictions(inputValue: string) {
  return getPlacePredictions(inputValue.trim()).catch(() => null);
}

function canApplyPredictionRefresh({
  isActive,
  skipPredictionsForValueRef,
}: Pick<
  RefreshAutocompletePredictionsInput,
  "isActive" | "skipPredictionsForValueRef"
>) {
  return isActive() && skipPredictionsForValueRef.current === null;
}

function applyPredictionRefreshResult({
  hasTypedInSessionRef,
  nextSuggestions,
  resetSuggestions,
  setActiveSuggestionIndex,
  setIsSuggestionsOpen,
  setSuggestions,
}: Pick<
  RefreshAutocompletePredictionsInput,
  | "hasTypedInSessionRef"
  | "resetSuggestions"
  | "setActiveSuggestionIndex"
  | "setIsSuggestionsOpen"
  | "setSuggestions"
> & {
  nextSuggestions: GoogleAutocompletePrediction[] | null;
}) {
  if (!nextSuggestions) {
    resetSuggestions();
    return;
  }

  setSuggestions(nextSuggestions);
  setIsSuggestionsOpen(
    hasTypedInSessionRef.current && Boolean(nextSuggestions.length),
  );
  setActiveSuggestionIndex(-1);
}

async function refreshAutocompletePredictions(
  input: RefreshAutocompletePredictionsInput,
) {
  const nextSuggestions = await fetchAutocompletePredictions(input.inputValue);

  if (!canApplyPredictionRefresh(input)) {
    return;
  }

  applyPredictionRefreshResult({
    hasTypedInSessionRef: input.hasTypedInSessionRef,
    nextSuggestions,
    resetSuggestions: input.resetSuggestions,
    setActiveSuggestionIndex: input.setActiveSuggestionIndex,
    setIsSuggestionsOpen: input.setIsSuggestionsOpen,
    setSuggestions: input.setSuggestions,
  });
}

function handleSuggestionKeyboardAction({
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

async function canUseCurrentArea(
  mapsReady: boolean,
  requestGoogleMaps: RequestGoogleMaps,
) {
  const isMapsReady = mapsReady || (await requestGoogleMaps());

  return canUseCurrentAreaLookup(isMapsReady, isGeolocationAvailable());
}

async function resolveCurrentAreaLookup(): Promise<CurrentAreaLookupResult> {
  const coordinates = await getCurrentCoordinates();
  const nextLocation = await reverseGeocodeCoordinates(coordinates);

  return { coordinates, nextLocation };
}

function useAutocompleteSuggestions({
  hasTypedInSessionRef,
  inputValue,
  isSettledResolvedValue,
  mapsReady,
  skipPredictionsForValueRef,
}: UseAutocompleteSuggestionsInput) {
  const [suggestions, setSuggestions] = useState<
    GoogleAutocompletePrediction[]
  >([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const visibleSuggestions = useMemo(
    () => getVisibleAutocompleteSuggestions(mapsReady, inputValue, suggestions),
    [inputValue, mapsReady, suggestions],
  );

  const resetSuggestions = useCallback(() => {
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
  }, []);

  useEffect(() => {
    setActiveSuggestionIndex((currentIndex) => {
      return getActiveSuggestionIndexForVisibleState(
        currentIndex,
        isSuggestionsOpen,
        visibleSuggestions.length,
      );
    });
  }, [isSuggestionsOpen, visibleSuggestions.length]);

  useEffect(() => {
    const predictionRequestDecision = getPredictionRequestDecision({
      hasSkippedValue: skipPredictionsForValueRef.current !== null,
      hasTypedInSession: hasTypedInSessionRef.current,
      inputValue,
      isSettledResolvedValue,
      mapsReady,
    });

    if (predictionRequestDecision !== "request") {
      if (predictionRequestDecision === "clear") {
        resetSuggestions();
      }

      return undefined;
    }

    let active = true;
    const handle = scheduleDelay(() => {
      void refreshAutocompletePredictions({
        hasTypedInSessionRef,
        inputValue,
        isActive: () => active,
        resetSuggestions,
        setActiveSuggestionIndex,
        setIsSuggestionsOpen,
        setSuggestions,
        skipPredictionsForValueRef,
      });
    }, 250);

    return () => {
      active = false;
      cancelDelay(handle);
    };
  }, [
    hasTypedInSessionRef,
    inputValue,
    isSettledResolvedValue,
    mapsReady,
    resetSuggestions,
    skipPredictionsForValueRef,
  ]);

  function closeSuggestions() {
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
  }

  function openSuggestions() {
    if (!hasTypedInSessionRef.current) {
      return;
    }

    if (visibleSuggestions.length === 0) {
      return;
    }

    setIsSuggestionsOpen(true);
  }

  function moveActiveSuggestion(direction: SuggestionNavigationDirection) {
    setIsSuggestionsOpen(true);
    setActiveSuggestionIndex((currentIndex) =>
      getWrappedSuggestionIndex(
        currentIndex,
        visibleSuggestions.length,
        direction,
      ),
    );
  }

  return {
    activeSuggestionIndex,
    closeSuggestions,
    isSuggestionsOpen,
    moveActiveSuggestion,
    openSuggestions,
    resetSuggestions,
    setActiveSuggestionIndex,
    suggestions: visibleSuggestions,
  };
}

function useAddressAutocompleteMessageState() {
  const [message, setMessage] = useState<AddressAutocompleteMessage | null>(
    null,
  );
  const [hasCurrentAreaError, setHasCurrentAreaError] = useState(false);

  function showMessage(text: string, tone: AddressAutocompleteMessageTone) {
    setMessage({ text, tone });
  }

  function clearMessage() {
    setMessage(null);
  }

  return {
    clearMessage,
    hasCurrentAreaError,
    message,
    setHasCurrentAreaError,
    showMessage,
  };
}

function usePredictionSelection({
  clearMessage,
  closeSuggestions,
  externalInputValue,
  hasTypedInSessionRef,
  mapsReady,
  onLocationSelect,
  resetSuggestions,
  setDraftInput,
  setHasCurrentAreaError,
  showMessage,
  skipPredictionsForValueRef,
}: UsePredictionSelectionInput) {
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);

  function beginPredictionResolution(prediction: GoogleAutocompletePrediction) {
    setIsResolvingPlace(true);
    clearMessage();
    setHasCurrentAreaError(false);
    hasTypedInSessionRef.current = false;
    skipPredictionsForValueRef.current = prediction.description;
    resetSuggestions();
  }

  function applyResolvedPrediction(nextLocation: LocationValue) {
    setDraftInput(
      createAddressAutocompleteDraftInput(
        externalInputValue,
        nextLocation.address,
      ),
    );
    skipPredictionsForValueRef.current = nextLocation.address;
    resetSuggestions();
    setIsResolvingPlace(false);
    onLocationSelect(nextLocation);
  }

  async function selectPrediction(prediction: GoogleAutocompletePrediction) {
    if (!mapsReady) {
      return;
    }

    beginPredictionResolution(prediction);

    try {
      const nextLocation = await resolvePlacePrediction(prediction);

      applyResolvedPrediction(nextLocation);
      return;
    } catch {
      showMessage(
        "We couldn't read that location. Try another result.",
        "error",
      );
      closeSuggestions();
      setIsResolvingPlace(false);
    }
  }

  return {
    isResolvingPlace,
    selectPrediction,
  };
}

function useCurrentAreaSelection({
  clearMessage,
  hasTypedInSessionRef,
  mapsReady,
  onLocationSelect,
  requestGoogleMaps,
  resetSuggestions,
  setDraftInput,
  setHasCurrentAreaError,
  showMessage,
  skipPredictionsForValueRef,
}: UseCurrentAreaSelectionInput) {
  const [isLocating, setIsLocating] = useState(false);

  function prepareForCurrentAreaLookup() {
    setIsLocating(true);
    showMessage("Finding your location...", "info");
    setHasCurrentAreaError(false);
    hasTypedInSessionRef.current = false;
    resetSuggestions();
  }

  function applyUnlabeledCurrentArea(coordinates: Coordinates) {
    showMessage("We found your area, but couldn't label it.", "info");
    skipPredictionsForValueRef.current = CURRENT_AREA_LABEL;
    setIsLocating(false);
    setHasCurrentAreaError(false);
    onLocationSelect(createCurrentAreaLocation(coordinates));
  }

  function applyResolvedCurrentArea(
    nextLocation: LocationValue,
    coordinates: Coordinates,
  ) {
    skipPredictionsForValueRef.current = nextLocation.address;
    setIsLocating(false);
    setHasCurrentAreaError(false);
    clearMessage();
    onLocationSelect(
      createResolvedCurrentAreaLocation(nextLocation, coordinates),
    );
    setDraftInput(null);
  }

  async function useCurrentArea() {
    if (!(await canUseCurrentArea(mapsReady, requestGoogleMaps))) {
      showMessage("Location access is unavailable in this browser.", "error");
      setHasCurrentAreaError(true);
      return;
    }

    prepareForCurrentAreaLookup();

    try {
      const { coordinates, nextLocation } = await resolveCurrentAreaLookup();

      if (!nextLocation) {
        applyUnlabeledCurrentArea(coordinates);
        return;
      }

      applyResolvedCurrentArea(nextLocation, coordinates);
      return;
    } catch (error) {
      showMessage(getCurrentAreaErrorMessage(error), "error");
      setHasCurrentAreaError(true);
      setIsLocating(false);
    }
  }

  return {
    isLocating,
    useCurrentArea,
  };
}

export function useAddressAutocomplete({
  value,
  onLocationSelect,
}: UseAddressAutocompleteOptions) {
  const externalInputValue = getExternalAddressInputValue(value);
  const [draftInput, setDraftInput] =
    useState<AddressAutocompleteDraftInput | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTypedInSessionRef = useRef(false);
  const skipPredictionsForValueRef = useRef<string | null>(null);
  const { mapsStatus, mapsReady, requestGoogleMaps } = useGoogleMapsStatus({
    loadOnMount: false,
  });
  const {
    clearMessage,
    hasCurrentAreaError,
    message,
    setHasCurrentAreaError,
    showMessage,
  } = useAddressAutocompleteMessageState();

  const inputValue = getAddressAutocompleteInputValue({
    draftInput,
    externalInputValue,
  });
  const messageOutput = getAddressAutocompleteMessageOutput(message);
  const isSettledResolvedValue = isResolvedLocationSettled(value, inputValue);
  const {
    activeSuggestionIndex,
    closeSuggestions,
    isSuggestionsOpen,
    moveActiveSuggestion,
    openSuggestions,
    resetSuggestions,
    setActiveSuggestionIndex,
    suggestions: visibleSuggestions,
  } = useAutocompleteSuggestions({
    hasTypedInSessionRef,
    inputValue,
    isSettledResolvedValue,
    mapsReady,
    skipPredictionsForValueRef,
  });
  const { isResolvingPlace, selectPrediction } = usePredictionSelection({
    clearMessage,
    closeSuggestions,
    externalInputValue,
    hasTypedInSessionRef,
    mapsReady,
    onLocationSelect,
    resetSuggestions,
    setDraftInput,
    setHasCurrentAreaError,
    showMessage,
    skipPredictionsForValueRef,
  });
  const { isLocating, useCurrentArea } = useCurrentAreaSelection({
    clearMessage,
    hasTypedInSessionRef,
    mapsReady,
    onLocationSelect,
    requestGoogleMaps,
    resetSuggestions,
    setDraftInput,
    setHasCurrentAreaError,
    showMessage,
    skipPredictionsForValueRef,
  });

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const manualInputChange = getManualAddressInputChange(
      event.target.value,
      externalInputValue,
    );

    hasTypedInSessionRef.current = true;
    skipPredictionsForValueRef.current = null;
    if (manualInputChange.hasSearchableInput) {
      void requestGoogleMaps();
    }
    setDraftInput(manualInputChange.draftInput);
    clearMessage();
    setHasCurrentAreaError(false);
    if (!manualInputChange.hasSearchableInput) {
      resetSuggestions();
    }
    onLocationSelect(manualInputChange.locationValue);
  }

  function clearLocation() {
    hasTypedInSessionRef.current = false;
    skipPredictionsForValueRef.current = null;
    setDraftInput(null);
    resetSuggestions();
    clearMessage();
    setHasCurrentAreaError(false);
    onLocationSelect(null);
  }

  function handleInputFocus() {
    void requestGoogleMaps();
    openSuggestions();
  }

  function selectActiveSuggestion(event: KeyboardEvent<HTMLInputElement>) {
    const suggestion = visibleSuggestions[activeSuggestionIndex];

    if (!suggestion) {
      return;
    }

    event.preventDefault();
    void selectPrediction(suggestion);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const keyboardAction = getSuggestionKeyboardAction({
      activeSuggestionIndex,
      canUseSuggestions: canUseAutocompleteSuggestions(
        visibleSuggestions.length,
        hasTypedInSessionRef.current,
      ),
      isSuggestionsOpen,
      key: event.key,
    });

    handleSuggestionKeyboardAction({
      closeSuggestions,
      event,
      keyboardAction,
      moveActiveSuggestion,
      selectActiveSuggestion,
    });
  }

  return {
    containerRef,
    inputValue,
    mapsStatus,
    mapsReady,
    suggestions: visibleSuggestions,
    isSuggestionsOpen,
    activeSuggestionIndex,
    isResolvingPlace,
    isLocating,
    message: messageOutput.message,
    messageTone: messageOutput.messageTone,
    hasCurrentAreaError,
    setActiveSuggestionIndex,
    handleInputFocus,
    handleInputChange,
    handleInputKeyDown,
    closeSuggestions,
    clearLocation,
    selectPrediction,
    useCurrentArea,
  };
}
