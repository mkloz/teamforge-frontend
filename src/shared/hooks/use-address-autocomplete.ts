import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

import { useGoogleMapsStatus } from "@/shared/hooks/use-google-maps-status";
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

interface UseAddressAutocompleteOptions {
  value: LocationValue | null;
  onLocationSelect: (value: LocationValue | null) => void;
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
  const [message, setMessage] = useState<string | null>(null);
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

      return;
    }

    let active = true;
    const handle = setTimeout(() => {
      getPlacePredictions(inputValue.trim())
        .then((nextSuggestions) => {
          if (!active || skipPredictionsForValueRef.current !== null) {
            return;
          }

          setSuggestions(nextSuggestions);
          setIsSuggestionsOpen(
            hasTypedInSessionRef.current && Boolean(nextSuggestions.length),
          );
          setActiveSuggestionIndex(-1);
        })
        .catch(() => {
          if (!active || skipPredictionsForValueRef.current !== null) {
            return;
          }

          setSuggestions([]);
          setIsSuggestionsOpen(false);
          setActiveSuggestionIndex(-1);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [inputValue, isSettledResolvedValue, mapsReady]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;

    hasTypedInSessionRef.current = true;
    skipPredictionsForValueRef.current = null;
    setDraftInput({ baseValue: externalInputValue, value: nextValue });
    setMessage(null);
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
    setMessage(null);
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

  async function selectPrediction(prediction: GoogleAutocompletePrediction) {
    if (!mapsReady) {
      return;
    }

    setIsResolvingPlace(true);
    setMessage(null);
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
      onLocationSelect(nextLocation);
    } catch {
      setMessage("We couldn't read that location. Try another result.");
      closeSuggestions();
    } finally {
      setIsResolvingPlace(false);
    }
  }

  async function useCurrentArea() {
    if (!mapsReady || !isGeolocationAvailable()) {
      setMessage("Location access is unavailable in this browser.");
      return;
    }

    setIsLocating(true);
    setMessage(null);
    hasTypedInSessionRef.current = false;
    setSuggestions([]);
    closeSuggestions();

    try {
      const coordinates = await getCurrentCoordinates();
      const nextLocation = await reverseGeocodeCoordinates(coordinates);

      if (!nextLocation) {
        setMessage("We found your area, but couldn't label it.");
        skipPredictionsForValueRef.current = "Current area";
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
      onLocationSelect({
        ...nextLocation,
        lat: coordinates.lat,
        lng: coordinates.lng,
      });
      setDraftInput(null);
    } catch {
      setMessage("Allow location access or search manually.");
    } finally {
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
    message,
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
