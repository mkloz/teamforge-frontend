// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createGooglePlacesSessionToken,
  getGooglePlacesErrorMessage,
  getPlaceSuggestions,
  resolvePlaceSuggestion,
} from "@/shared/lib/maps/google-places-service";

function formattableText(value: string): GoogleFormattableText {
  return { toString: () => value };
}

describe("Google Places API (New) adapter", () => {
  const fetchAutocompleteSuggestions =
    vi.fn<
      GooglePlacesLibrary["AutocompleteSuggestion"]["fetchAutocompleteSuggestions"]
    >();
  class SessionToken {}

  beforeEach(() => {
    fetchAutocompleteSuggestions.mockReset();
    window.__findafewGooglePlacesLibrary = {
      AutocompleteSessionToken: SessionToken,
      AutocompleteSuggestion: { fetchAutocompleteSuggestions },
    };
  });

  afterEach(() => {
    delete window.__findafewGooglePlacesLibrary;
  });

  it("uses the supplied session token and maps only place predictions", async () => {
    const token = createGooglePlacesSessionToken();
    const place = createPlace();
    const prediction: GooglePlacePrediction = {
      mainText: formattableText("York Minster"),
      placeId: "place-1",
      secondaryText: formattableText("York, UK"),
      text: formattableText("York Minster, York, UK"),
      toPlace: () => place,
    };
    fetchAutocompleteSuggestions.mockResolvedValue({
      suggestions: [{ placePrediction: prediction }, {}],
    });

    await expect(getPlaceSuggestions("York", token)).resolves.toEqual([
      {
        description: "York Minster, York, UK",
        id: "place-1",
        mainText: "York Minster",
        prediction,
        secondaryText: "York, UK",
      },
    ]);
    expect(fetchAutocompleteSuggestions).toHaveBeenCalledWith({
      input: "York",
      sessionToken: token,
    });
  });

  it("fetches only the frozen place fields and projects canonical location data", async () => {
    const place = createPlace();
    const suggestion = {
      description: "York Minster, York, UK",
      id: "place-1",
      mainText: "York Minster",
      prediction: {
        placeId: "place-1",
        text: formattableText("York Minster, York, UK"),
        toPlace: () => place,
      },
      secondaryText: "York, UK",
    } satisfies import("@/shared/lib/maps/location.types").GooglePlaceSuggestion;

    await expect(resolvePlaceSuggestion(suggestion)).resolves.toEqual({
      address: "Deangate, York YO1 7HH, UK",
      city: "York",
      lat: 53.9623,
      lng: -1.0819,
      placeId: "place-1",
    });
    expect(place.fetchFields).toHaveBeenCalledWith({
      fields: [
        "id",
        "displayName",
        "formattedAddress",
        "location",
        "addressComponents",
      ],
    });
  });

  it("keeps quota and general provider failures warm and manually recoverable", () => {
    expect(
      getGooglePlacesErrorMessage(new Error("RESOURCE_EXHAUSTED: quota")),
    ).toContain("Type the place manually");
    expect(getGooglePlacesErrorMessage(new Error("network failed"))).toBe(
      "Location suggestions are unavailable. You can still type the place manually.",
    );
  });
});

function createPlace() {
  return {
    addressComponents: [
      { longText: "York", shortText: "York", types: ["postal_town"] },
    ],
    displayName: "York Minster",
    fetchFields: vi
      .fn<(options: GooglePlaceFetchFieldsOptions) => Promise<void>>()
      .mockResolvedValue(undefined),
    formattedAddress: "Deangate, York YO1 7HH, UK",
    id: "place-1",
    location: {
      lat: () => 53.9623,
      lng: () => -1.0819,
    },
  };
}
