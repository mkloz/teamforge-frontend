import type { LocationValue } from "@/shared/lib/maps/location.types";

const CITY_ADDRESS_COMPONENT_TYPES = [
  "locality",
  "postal_town",
  "administrative_area_level_2",
  "administrative_area_level_1",
];

function hasAddressComponentType(
  component: GoogleAddressComponent,
  type: string,
) {
  return component.types.includes(type);
}

function findAddressComponentByType(
  components: GoogleAddressComponent[],
  type: string,
) {
  return components.find((component) =>
    hasAddressComponentType(component, type),
  );
}

function findPreferredCityComponent(components: GoogleAddressComponent[]) {
  return CITY_ADDRESS_COMPONENT_TYPES.reduce<
    GoogleAddressComponent | undefined
  >(
    (match, type) => match ?? findAddressComponentByType(components, type),
    undefined,
  );
}

function getCityFromComponents(components: GoogleAddressComponent[] = []) {
  return findPreferredCityComponent(components)?.long_name ?? "";
}

function getPlaceAddress(place: GooglePlaceResult, fallbackAddress: string) {
  return place.formatted_address ?? place.name ?? fallbackAddress;
}

function getPlaceCoordinates(location: GoogleLatLng | null | undefined) {
  return {
    lat: location?.lat() ?? null,
    lng: location?.lng() ?? null,
  };
}

function getAddressFallbackCity(address: string) {
  return address.split(",")[0]?.trim() ?? address;
}

function getPlaceCity(address: string, components?: GoogleAddressComponent[]) {
  const city =
    getCityFromComponents(components) ?? getAddressFallbackCity(address);

  return city || address;
}

export function locationFromPlace(
  place: GooglePlaceResult,
  fallbackAddress: string,
  placeId?: string,
): LocationValue {
  const address = getPlaceAddress(place, fallbackAddress);
  const coordinates = getPlaceCoordinates(place.geometry?.location);

  return {
    address,
    city: getPlaceCity(address, place.address_components),
    lat: coordinates.lat,
    lng: coordinates.lng,
    placeId: placeId ?? null,
  };
}
