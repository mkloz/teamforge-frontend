import { scenarioRuntime } from "virtual:teamforge-scenario-runtime";
import { config } from "@/config/config";
import {
  getBrowserDocument,
  getBrowserWindow,
} from "@/shared/lib/browser-environment";

export function hasGoogleMapsApiKey() {
  return scenarioRuntime.allows("maps") && Boolean(config.googleMapsApiKey);
}

export function isGooglePlacesReady() {
  const browserWindow = getBrowserWindow();

  return Boolean(browserWindow?.google?.maps?.places);
}

export function loadGoogleMaps() {
  if (!scenarioRuntime.allows("maps")) {
    return Promise.reject(
      new Error("Google Maps is disabled while Scenario Mode is active."),
    );
  }

  const apiKey = config.googleMapsApiKey;

  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is not configured."));
  }

  const browserWindow = getBrowserWindow();
  const browserDocument = getBrowserDocument();

  if (isGooglePlacesReady()) {
    return Promise.resolve();
  }

  if (!browserWindow || !browserDocument) {
    return Promise.reject(new Error("Google Maps requires a browser."));
  }

  if (browserWindow.__teamforgeGoogleMapsPromise) {
    return browserWindow.__teamforgeGoogleMapsPromise;
  }

  browserWindow.__teamforgeGoogleMapsPromise = new Promise<void>(
    (resolve, reject) => {
      const rejectAndReset = (error: Error) => {
        browserWindow.__teamforgeGoogleMapsPromise = undefined;
        reject(error);
      };

      const existingScript = browserDocument.querySelector<HTMLScriptElement>(
        'script[data-teamforge-google-maps="true"]',
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), {
          once: true,
        });
        existingScript.addEventListener(
          "error",
          () => rejectAndReset(new Error("Google Maps failed to load.")),
          { once: true },
        );
        return;
      }

      const script = browserDocument.createElement("script");
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
      browserDocument.head.appendChild(script);
    },
  );

  return browserWindow.__teamforgeGoogleMapsPromise;
}
