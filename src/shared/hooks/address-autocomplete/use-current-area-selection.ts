import { useState } from "react";
import {
  CURRENT_AREA_LABEL,
  canUseCurrentAreaLookup,
  createCurrentAreaLocation,
  createResolvedCurrentAreaLocation,
  getCurrentAreaErrorMessage,
} from "@/shared/hooks/use-address-autocomplete-state";
import {
  getCurrentCoordinates,
  isGeolocationAvailable,
} from "@/shared/lib/maps/browser-geolocation";
import { reverseGeocodeCoordinates } from "@/shared/lib/maps/google-places-service";
import type {
  Coordinates,
  LocationValue,
} from "@/shared/lib/maps/location.types";
import type {
  RequestGoogleMaps,
  UseCurrentAreaSelectionInput,
} from "./address-autocomplete-types";

interface CurrentAreaLookupResult {
  coordinates: Coordinates;
  nextLocation: LocationValue | null;
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

export function useCurrentAreaSelection({
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
