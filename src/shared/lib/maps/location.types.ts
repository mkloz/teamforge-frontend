export interface LocationValue {
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  placeId?: string | null;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GooglePlaceSuggestion {
  description: string;
  id: string;
  mainText: string;
  prediction: GooglePlacePrediction;
  secondaryText: string | null;
}

export type GoogleMapsStatus = "idle" | "loading" | "ready" | "unavailable";
