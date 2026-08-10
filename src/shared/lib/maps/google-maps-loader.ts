import { scenarioRuntime } from "virtual:scenario-runtime";
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

  return Boolean(
    browserWindow?.__findafewGooglePlacesLibrary?.AutocompleteSuggestion &&
      browserWindow.__findafewGooglePlacesLibrary.AutocompleteSessionToken,
  );
}

async function importPlacesLibrary(browserWindow: Window) {
  const maps = browserWindow.google?.maps;

  if (!maps?.importLibrary) {
    throw new Error("Google Places did not finish loading.");
  }

  const places = await maps.importLibrary("places");
  browserWindow.__findafewGooglePlacesLibrary = places;
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

  if (browserWindow.__findafewGoogleMapsPromise) {
    return browserWindow.__findafewGoogleMapsPromise;
  }

  if (browserWindow.google?.maps?.importLibrary) {
    browserWindow.__findafewGoogleMapsPromise = importPlacesLibrary(
      browserWindow,
    ).catch((error) => {
      browserWindow.__findafewGoogleMapsPromise = undefined;
      throw error;
    });
    return browserWindow.__findafewGoogleMapsPromise;
  }

  browserWindow.__findafewGoogleMapsPromise = new Promise<void>(
    (resolve, reject) => {
      const rejectAndReset = (error: Error) => {
        browserWindow.__findafewGoogleMapsPromise = undefined;
        reject(error);
      };

      const resolvePlaces = () => {
        void importPlacesLibrary(browserWindow).then(resolve, rejectAndReset);
      };

      const existingScript = browserDocument.querySelector<HTMLScriptElement>(
        'script[data-findafew-google-maps="true"]',
      );

      if (existingScript) {
        existingScript.addEventListener("load", resolvePlaces, {
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
      )}&libraries=places&loading=async&v=weekly`;
      script.async = true;
      script.defer = true;
      script.dataset.findafewGoogleMaps = "true";
      script.addEventListener("load", resolvePlaces, { once: true });
      script.addEventListener(
        "error",
        () => rejectAndReset(new Error("Google Maps failed to load.")),
        { once: true },
      );
      browserDocument.head.appendChild(script);
    },
  );

  return browserWindow.__findafewGoogleMapsPromise;
}
