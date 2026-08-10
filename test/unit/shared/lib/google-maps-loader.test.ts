// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/config", () => ({
  config: { googleMapsApiKey: "test-maps-key" },
}));

vi.mock("virtual:scenario-runtime", () => ({
  scenarioRuntime: { allows: () => true },
}));

import {
  isGooglePlacesReady,
  loadGoogleMaps,
} from "@/shared/lib/maps/google-maps-loader";

describe("Google Places loader", () => {
  afterEach(() => {
    delete window.google;
    delete window.__findafewGoogleMapsPromise;
    delete window.__findafewGooglePlacesLibrary;
  });

  it("imports Places API (New) once and reuses the ready library", async () => {
    const places = createPlacesLibrary();
    const importLibrary = vi
      .fn<(name: "places") => Promise<GooglePlacesLibrary>>()
      .mockResolvedValue(places);
    window.google = createGoogleGlobal(importLibrary);

    await loadGoogleMaps();
    await loadGoogleMaps();

    expect(importLibrary).toHaveBeenCalledOnce();
    expect(importLibrary).toHaveBeenCalledWith("places");
    expect(window.__findafewGooglePlacesLibrary).toBe(places);
    expect(isGooglePlacesReady()).toBe(true);
  });

  it("clears a failed import so a deliberate retry can recover", async () => {
    const importLibrary = vi
      .fn<(name: "places") => Promise<GooglePlacesLibrary>>()
      .mockRejectedValueOnce(new Error("quota unavailable"))
      .mockResolvedValueOnce(createPlacesLibrary());
    window.google = createGoogleGlobal(importLibrary);

    await expect(loadGoogleMaps()).rejects.toThrow("quota unavailable");
    expect(window.__findafewGoogleMapsPromise).toBeUndefined();

    await expect(loadGoogleMaps()).resolves.toBeUndefined();
    expect(importLibrary).toHaveBeenCalledTimes(2);
    expect(isGooglePlacesReady()).toBe(true);
  });
});

function createPlacesLibrary(): GooglePlacesLibrary {
  class SessionToken {}

  return {
    AutocompleteSessionToken: SessionToken,
    AutocompleteSuggestion: {
      fetchAutocompleteSuggestions: vi
        .fn<
          GooglePlacesLibrary["AutocompleteSuggestion"]["fetchAutocompleteSuggestions"]
        >()
        .mockResolvedValue({ suggestions: [] }),
    },
  };
}

function createGoogleGlobal(
  importLibrary: GoogleMapsGlobal["maps"]["importLibrary"],
): NonNullable<Window["google"]> {
  return {
    accounts: {
      oauth2: {
        initCodeClient:
          vi.fn<
            NonNullable<
              Window["google"]
            >["accounts"]["oauth2"]["initCodeClient"]
          >(),
      },
    },
    maps: { importLibrary },
  };
}
