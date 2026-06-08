import { hasBrowserNavigator } from "@/shared/lib/browser-environment";
import type { Coordinates } from "@/shared/lib/maps/location.types";

export function isGeolocationAvailable() {
  if (!hasBrowserNavigator()) {
    return false;
  }

  return Boolean(navigator.geolocation);
}

export function getCurrentCoordinates() {
  if (!isGeolocationAvailable()) {
    return Promise.reject(new Error("Geolocation is unavailable."));
  }

  return new Promise<Coordinates>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      reject,
      {
        enableHighAccuracy: false,
        maximumAge: 300_000,
        timeout: 10_000,
      },
    );
  });
}
