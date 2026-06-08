import { config } from "@/config/config";
import {
  hasBrowserDocument,
  hasBrowserWindow,
} from "@/shared/lib/browser-environment";

export function hasGoogleMapsApiKey() {
  return Boolean(config.googleMapsApiKey);
}

export function isGooglePlacesReady() {
  if (!hasBrowserWindow()) {
    return false;
  }

  return Boolean(window.google?.maps?.places);
}

export function loadGoogleMaps() {
  const apiKey = config.googleMapsApiKey;

  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is not configured."));
  }

  if (!hasBrowserWindow() || !hasBrowserDocument()) {
    return Promise.reject(new Error("Google Maps requires a browser."));
  }

  if (isGooglePlacesReady()) {
    return Promise.resolve();
  }

  if (window.__teamforgeGoogleMapsPromise) {
    return window.__teamforgeGoogleMapsPromise;
  }

  window.__teamforgeGoogleMapsPromise = new Promise<void>((resolve, reject) => {
    const rejectAndReset = (error: Error) => {
      window.__teamforgeGoogleMapsPromise = undefined;
      reject(error);
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-teamforge-google-maps="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => rejectAndReset(new Error("Google Maps failed to load.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.teamforgeGoogleMaps = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => rejectAndReset(new Error("Google Maps failed to load.")),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return window.__teamforgeGoogleMapsPromise;
}
