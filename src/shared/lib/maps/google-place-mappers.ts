import type { LocationValue } from "@/shared/lib/maps/location.types";

function getCityFromComponents(components: GoogleAddressComponent[] = []) {
  const preferredTypes = [
    "locality",
    "postal_town",
    "administrative_area_level_2",
    "administrative_area_level_1",
  ];

  for (const type of preferredTypes) {
    const match = components.find((component) =>
      component.types.includes(type),
    );

    if (match) {
      return match.long_name;
    }
  }

  return "";
}

export function locationFromPlace(
  place: GooglePlaceResult,
  fallbackAddress: string,
  placeId?: string,
): LocationValue {
  const address = place.formatted_address ?? place.name ?? fallbackAddress;
  const city =
    getCityFromComponents(place.address_components) ??
    address.split(",")[0]?.trim() ??
    address;
  const location = place.geometry?.location;

  return {
    address,
    city: city || address,
    lat: location?.lat() ?? null,
    lng: location?.lng() ?? null,
    placeId: placeId ?? null,
  };
}
