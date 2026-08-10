export type FindafewGoogleMapsTypes = never;

declare global {
  interface Window {
    google?: Partial<GoogleMapsGlobal> & GoogleIdentityServicesGlobal;
    __findafewGooglePlacesLibrary?: GooglePlacesLibrary;
    __findafewGoogleMapsPromise?: Promise<void>;
    __AUDIT_AUTH_BOOTSTRAPPED?: boolean;
    __APP_BOOT_STARTED_AT?: number;
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
          ux_mode: "popup";
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
      importLibrary: (name: "places") => Promise<GooglePlacesLibrary>;
    };
  }

  interface GoogleLatLng {
    lat(): number;
    lng(): number;
  }

  interface GoogleFormattableText {
    toString(): string;
  }

  interface GoogleAutocompleteSessionToken {}

  interface GoogleAutocompleteSuggestion {
    placePrediction?: GooglePlacePrediction;
  }

  interface GooglePlacePrediction {
    mainText?: GoogleFormattableText;
    placeId: string;
    secondaryText?: GoogleFormattableText;
    text: GoogleFormattableText;
    toPlace(): GooglePlace;
  }

  interface GoogleAddressComponent {
    longText: string;
    shortText: string;
    types: string[];
  }

  interface GooglePlace {
    addressComponents?: GoogleAddressComponent[];
    displayName?: string;
    fetchFields(options: { fields: GooglePlaceField[] }): Promise<void>;
    formattedAddress?: string;
    id?: string;
    location?: GoogleLatLng | null;
  }

  type GooglePlaceField =
    | "addressComponents"
    | "displayName"
    | "formattedAddress"
    | "id"
    | "location";

  interface GooglePlacesLibrary {
    AutocompleteSessionToken: new () => GoogleAutocompleteSessionToken;
    AutocompleteSuggestion: {
      fetchAutocompleteSuggestions(request: {
        input: string;
        sessionToken: GoogleAutocompleteSessionToken;
      }): Promise<{ suggestions: GoogleAutocompleteSuggestion[] }>;
    };
  }
}
