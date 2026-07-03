export type TeamForgeGoogleMapsTypes = never;

declare global {
  interface Window {
    google?: Partial<GoogleMapsGlobal> & GoogleIdentityServicesGlobal;
    __teamforgeGoogleMapsPromise?: Promise<void>;
    __TEAMFORGE_AUDIT_AUTH_BOOTSTRAPPED?: boolean;
    __TEAMFORGE_BOOT_STARTED_AT?: number;
  }

  interface Navigator {
    clearAppBadge?: () => Promise<void>;
    setAppBadge?: (contents?: number) => Promise<void>;
    standalone?: boolean;
  }

  interface GoogleIdentityServicesGlobal {
    accounts?: {
      oauth2?: {
        initCodeClient: (config: {
          callback: (response: GoogleCodeResponse) => void;
          client_id: string;
          error_callback: (error: GoogleNonOAuthError) => void;
          scope: string;
        }) => GoogleCodeClient;
      };
    };
  }

  interface GoogleCodeResponse {
    code?: string;
    error?: string;
    error_description?: string;
    error_uri?: string;
  }

  interface GoogleNonOAuthError {
    type: "popup_failed_to_open" | "popup_closed" | "unknown";
  }

  interface GoogleCodeClient {
    requestCode: () => void;
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
