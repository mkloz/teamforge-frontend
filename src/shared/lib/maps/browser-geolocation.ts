import { getBrowserNavigator } from "@/shared/lib/browser-environment";
import type { Coordinates } from "@/shared/lib/maps/location.types";

export function isGeolocationAvailable() {
  return Boolean(getBrowserNavigator()?.geolocation);
}

export function getCurrentCoordinates() {
  const geolocation = getBrowserNavigator()?.geolocation;

  if (!geolocation) {
    return Promise.reject(new Error("Geolocation is unavailable."));
  }

  return new Promise<Coordinates>((resolve, reject) => {
    geolocation.getCurrentPosition(
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
