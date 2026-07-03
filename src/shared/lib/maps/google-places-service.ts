import {
  getBrowserDocument,
  getBrowserWindow,
} from "@/shared/lib/browser-environment";
import { isGooglePlacesReady } from "@/shared/lib/maps/google-maps-loader";
import { locationFromPlace } from "@/shared/lib/maps/google-place-mappers";
import type {
  Coordinates,
  LocationValue,
} from "@/shared/lib/maps/location.types";

const PLACE_DETAIL_FIELDS = [
  "formatted_address",
  "geometry",
  "address_components",
  "name",
];

function requireGoogleMaps() {
  const maps = getBrowserWindow()?.google?.maps;

  if (!isGooglePlacesReady() || !maps?.places) {
    throw new Error("Google Maps is unavailable.");
  }

  return maps;
}

export function getPlacePredictions(input: string) {
  const maps = requireGoogleMaps();
  const service = new maps.places.AutocompleteService();

  return new Promise<GoogleAutocompletePrediction[]>((resolve) => {
    service.getPlacePredictions(
      {
        input,
        types: ["geocode", "establishment"],
      },
      (predictions, status) => {
        if (status !== maps.places.PlacesServiceStatus.OK) {
          resolve([]);
          return;
        }

        resolve(predictions ?? []);
      },
    );
  });
}

export function resolvePlacePrediction(
  prediction: GoogleAutocompletePrediction,
) {
  const browserDocument = getBrowserDocument();

  if (!browserDocument) {
    return Promise.reject(new Error("Google Places requires a browser."));
  }

  const maps = requireGoogleMaps();
  const service = new maps.places.PlacesService(
    browserDocument.createElement("div"),
  );

  return new Promise<LocationValue>((resolve, reject) => {
    service.getDetails(
      {
        placeId: prediction.place_id,
        fields: PLACE_DETAIL_FIELDS,
      },
      (place, status) => {
        if (status !== maps.places.PlacesServiceStatus.OK || !place) {
          reject(new Error("Google Maps could not resolve that place."));
          return;
        }

        resolve(
          locationFromPlace(place, prediction.description, prediction.place_id),
        );
      },
    );
  });
}

export function reverseGeocodeCoordinates({ lat, lng }: Coordinates) {
  const maps = requireGoogleMaps();
  const geocoder = new maps.Geocoder();

  return new Promise<LocationValue | null>((resolve) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status !== maps.GeocoderStatus.OK || !results?.[0]) {
        resolve(null);
        return;
      }

      resolve(locationFromPlace(results[0], "Current area"));
    });
  });
}
