import type { ChangeEvent, KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

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
import type { LocationValue } from "@/shared/lib/maps/location.types";

type AddressAutocompleteMessageTone = "error" | "info";

interface AddressAutocompleteMessage {
  text: string;
  tone: AddressAutocompleteMessageTone;
}

interface UseAddressAutocompleteOptions {
  value: LocationValue | null;
  onLocationSelect: (value: LocationValue | null) => void;
}

function isGeolocationPositionError(
  error: unknown,
): error is GeolocationPositionError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "number"
  );
}

function getCurrentAreaErrorMessage(error: unknown) {
  if (!window.isSecureContext) {
    return "Current location needs HTTPS or a trusted localhost URL.";
  }

  if (!isGeolocationPositionError(error)) {
    return "We couldn't get your location. Try again or search manually.";
  }

  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location is blocked for this site. Check browser permissions or search manually.";
    case error.POSITION_UNAVAILABLE:
      return "Your browser couldn't get a location fix. Try again or search manually.";
    case error.TIMEOUT:
      return "Location lookup timed out. Try again or search manually.";
    default:
      return "We couldn't get your location. Try again or search manually.";
  }
}

export function useAddressAutocomplete({
  value,
  onLocationSelect,
}: UseAddressAutocompleteOptions) {
  const externalInputValue = value?.address ?? "";
  const [draftInput, setDraftInput] = useState<{
    baseValue: string;
    value: string;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<
    GoogleAutocompletePrediction[]
  >([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [message, setMessage] = useState<AddressAutocompleteMessage | null>(
    null,
  );
  const [hasCurrentAreaError, setHasCurrentAreaError] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTypedInSessionRef = useRef(false);
  const skipPredictionsForValueRef = useRef<string | null>(null);
  const { mapsStatus, mapsReady } = useGoogleMapsStatus();

  const inputValue =
    draftInput && draftInput.baseValue === externalInputValue
      ? draftInput.value
      : externalInputValue;

  const visibleSuggestions = useMemo(
    () => (mapsReady && inputValue.trim().length >= 3 ? suggestions : []),
    [inputValue, mapsReady, suggestions],
  );
  const isSettledResolvedValue =
    Boolean(value?.address) &&
    inputValue === value?.address &&
    (Boolean(value?.placeId) || value?.lat != null || value?.lng != null);

  function showMessage(text: string, tone: AddressAutocompleteMessageTone) {
    setMessage({ text, tone });
  }

  function clearMessage() {
    setMessage(null);
  }

  useEffect(() => {
    setActiveSuggestionIndex((currentIndex) => {
      if (!isSuggestionsOpen || visibleSuggestions.length === 0) {
        return -1;
      }

      return Math.min(currentIndex, visibleSuggestions.length - 1);
    });
  }, [isSuggestionsOpen, visibleSuggestions.length]);

  useEffect(() => {
    if (
      !mapsReady ||
      !hasTypedInSessionRef.current ||
      inputValue.trim().length < 3 ||
      isSettledResolvedValue ||
      skipPredictionsForValueRef.current !== null
    ) {
      if (
        isSettledResolvedValue ||
        skipPredictionsForValueRef.current !== null
      ) {
        setSuggestions([]);
        setIsSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }

      return undefined;
    }

    let active = true;
    const handle = scheduleDelay(() => {
      async function refreshPredictions() {
        const nextSuggestions = await getPlacePredictions(
          inputValue.trim(),
        ).catch(() => null);

        if (!active || skipPredictionsForValueRef.current !== null) {
          return;
        }

        if (!nextSuggestions) {
          setSuggestions([]);
          setIsSuggestionsOpen(false);
          setActiveSuggestionIndex(-1);
          return;
        }

        setSuggestions(nextSuggestions);
        setIsSuggestionsOpen(
          hasTypedInSessionRef.current && Boolean(nextSuggestions.length),
        );
        setActiveSuggestionIndex(-1);
      }

      void refreshPredictions();
    }, 250);

    return () => {
      active = false;
      cancelDelay(handle);
    };
  }, [inputValue, isSettledResolvedValue, mapsReady]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;

    hasTypedInSessionRef.current = true;
    skipPredictionsForValueRef.current = null;
    setDraftInput({ baseValue: externalInputValue, value: nextValue });
    clearMessage();
    setHasCurrentAreaError(false);
    if (nextValue.trim().length < 3) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
    }
    onLocationSelect({
      address: nextValue,
      city: nextValue,
      lat: null,
      lng: null,
      placeId: null,
    });
  }

  function clearLocation() {
    hasTypedInSessionRef.current = false;
    skipPredictionsForValueRef.current = null;
    setDraftInput(null);
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
    clearMessage();
    setHasCurrentAreaError(false);
    onLocationSelect(null);
  }

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

  function handleInputFocus() {
    openSuggestions();
  }

  async function selectPrediction(prediction: GoogleAutocompletePrediction) {
    if (!mapsReady) {
      return;
    }

    setIsResolvingPlace(true);
    clearMessage();
    setHasCurrentAreaError(false);
    hasTypedInSessionRef.current = false;
    skipPredictionsForValueRef.current = prediction.description;
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);

    try {
      const nextLocation = await resolvePlacePrediction(prediction);

      setDraftInput({
        baseValue: externalInputValue,
        value: nextLocation.address,
      });
      skipPredictionsForValueRef.current = nextLocation.address;
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
      setIsResolvingPlace(false);
      onLocationSelect(nextLocation);
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

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      closeSuggestions();
      return;
    }

    if (event.key === "Tab") {
      closeSuggestions();
      return;
    }

    if (visibleSuggestions.length === 0) {
      return;
    }

    if (!hasTypedInSessionRef.current) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsSuggestionsOpen(true);
      setActiveSuggestionIndex((currentIndex) =>
        currentIndex < visibleSuggestions.length - 1 ? currentIndex + 1 : 0,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsSuggestionsOpen(true);
      setActiveSuggestionIndex((currentIndex) =>
        currentIndex > 0 ? currentIndex - 1 : visibleSuggestions.length - 1,
      );
      return;
    }

    if (
      event.key === "Enter" &&
      isSuggestionsOpen &&
      activeSuggestionIndex >= 0
    ) {
      const suggestion = visibleSuggestions[activeSuggestionIndex];

      if (!suggestion) {
        return;
      }

      event.preventDefault();
      void selectPrediction(suggestion);
    }
  }

  async function useCurrentArea() {
    if (!mapsReady || !isGeolocationAvailable()) {
      showMessage("Location access is unavailable in this browser.", "error");
      setHasCurrentAreaError(true);
      return;
    }

    setIsLocating(true);
    showMessage("Finding your location...", "info");
    setHasCurrentAreaError(false);
    hasTypedInSessionRef.current = false;
    setSuggestions([]);
    closeSuggestions();

    try {
      const coordinates = await getCurrentCoordinates();
      const nextLocation = await reverseGeocodeCoordinates(coordinates);

      if (!nextLocation) {
        showMessage("We found your area, but couldn't label it.", "info");
        skipPredictionsForValueRef.current = "Current area";
        setIsLocating(false);
        setHasCurrentAreaError(false);
        onLocationSelect({
          address: "Current area",
          city: "Current area",
          lat: coordinates.lat,
          lng: coordinates.lng,
          placeId: null,
        });
        return;
      }

      skipPredictionsForValueRef.current = nextLocation.address;
      setIsLocating(false);
      setHasCurrentAreaError(false);
      clearMessage();
      onLocationSelect({
        ...nextLocation,
        lat: coordinates.lat,
        lng: coordinates.lng,
      });
      setDraftInput(null);
      return;
    } catch (error) {
      showMessage(getCurrentAreaErrorMessage(error), "error");
      setHasCurrentAreaError(true);
      setIsLocating(false);
    }
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
    message: message?.text ?? null,
    messageTone: message?.tone ?? null,
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
