import { getBrowserWindow } from "@/shared/lib/browser-environment";
import { isGooglePlacesReady } from "@/shared/lib/maps/google-maps-loader";
import { locationFromPlace } from "@/shared/lib/maps/google-place-mappers";
import type {
  GooglePlaceSuggestion,
  LocationValue,
} from "@/shared/lib/maps/location.types";

const PLACE_DETAIL_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "addressComponents",
] satisfies GooglePlaceField[];

function requireGooglePlaces() {
  const places = getBrowserWindow()?.__findafewGooglePlacesLibrary;

  if (!isGooglePlacesReady() || !places) {
    throw new Error("Google Places is unavailable.");
  }

  return places;
}

export function createGooglePlacesSessionToken() {
  const places = requireGooglePlaces();
  return new places.AutocompleteSessionToken();
}

export async function getPlaceSuggestions(
  input: string,
  sessionToken: GoogleAutocompleteSessionToken,
) {
  const places = requireGooglePlaces();
  const { suggestions } =
    await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      sessionToken,
    });

  return suggestions.flatMap(mapAutocompleteSuggestion);
}

function mapAutocompleteSuggestion(
  suggestion: GoogleAutocompleteSuggestion,
): GooglePlaceSuggestion[] {
  const prediction = suggestion.placePrediction;

  if (!prediction) {
    return [];
  }

  return [
    {
      description: prediction.text.toString(),
      id: prediction.placeId,
      mainText: prediction.mainText?.toString() ?? prediction.text.toString(),
      prediction,
      secondaryText: prediction.secondaryText?.toString() ?? null,
    },
  ];
}

export async function resolvePlaceSuggestion(
  suggestion: GooglePlaceSuggestion,
): Promise<LocationValue> {
  const place = suggestion.prediction.toPlace();
  await place.fetchFields({ fields: PLACE_DETAIL_FIELDS });
  return locationFromPlace(place, suggestion.description, suggestion.id);
}

export function getGooglePlacesErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (
    message.includes("quota") ||
    message.includes("over_query_limit") ||
    message.includes("resource_exhausted")
  ) {
    return "Location suggestions are busy right now. Type the place manually, or try again in a moment.";
  }

  return "Location suggestions are unavailable. You can still type the place manually.";
}
