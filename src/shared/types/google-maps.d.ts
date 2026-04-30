export {};

declare global {
  interface Window {
    google?: GoogleMapsGlobal;
    __teamforgeGoogleMapsPromise?: Promise<void>;
  }

  interface GoogleMapsGlobal {
    maps: {
      Geocoder: new () => GoogleGeocoder;
      GeocoderStatus: {
        OK: string;
      };
      LatLng: new (lat: number, lng: number) => GoogleLatLng;
      places: {
        AutocompleteService: new () => GoogleAutocompleteService;
        PlacesService: new (container: HTMLDivElement) => GooglePlacesService;
        PlacesServiceStatus: {
          OK: string;
        };
      };
    };
  }

  interface GoogleLatLng {
    lat(): number;
    lng(): number;
  }

  interface GoogleAutocompletePrediction {
    description: string;
    place_id: string;
    structured_formatting?: {
      main_text: string;
      secondary_text?: string;
    };
  }

  interface GoogleAutocompleteService {
    getPlacePredictions(
      request: {
        input: string;
        types?: string[];
      },
      callback: (
        predictions: GoogleAutocompletePrediction[] | null,
        status: string,
      ) => void,
    ): void;
  }

  interface GoogleAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  interface GooglePlaceResult {
    name?: string;
    formatted_address?: string;
    geometry?: {
      location?: GoogleLatLng;
    };
    address_components?: GoogleAddressComponent[];
  }

  interface GooglePlacesService {
    getDetails(
      request: {
        placeId: string;
        fields: string[];
      },
      callback: (place: GooglePlaceResult | null, status: string) => void,
    ): void;
  }

  interface GoogleGeocoder {
    geocode(
      request: {
        location: {
          lat: number;
          lng: number;
        };
      },
      callback: (results: GooglePlaceResult[] | null, status: string) => void,
    ): void;
  }
}
