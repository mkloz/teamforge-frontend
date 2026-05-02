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

export type GoogleMapsStatus = "idle" | "loading" | "ready" | "unavailable";
