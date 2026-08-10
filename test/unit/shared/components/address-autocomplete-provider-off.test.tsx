// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/hooks/use-google-maps-status", () => ({
  useGoogleMapsStatus: () => ({
    mapsReady: false,
    mapsStatus: "unavailable",
    requestGoogleMaps: () => Promise.resolve(false),
  }),
}));

import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import {
  AddressSuggestionsPanel,
  type AddressSuggestionsPanelProps,
} from "@/shared/components/maps/address-autocomplete/address-suggestions-panel";

interface HarnessLocation {
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  placeId?: string | null;
}

describe("address autocomplete provider-off behavior", () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, "geolocation");
  });

  it("keeps manual text and native private coordinates usable without Places", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: {
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              latitude: 53.959,
              longitude: -1.081,
              speed: null,
              toJSON: () => ({}),
            },
            timestamp: Date.now(),
            toJSON: () => ({}),
          }),
      },
    });
    const user = userEvent.setup();
    render(<ProviderOffHarness />);

    expect(
      screen.getByText(
        "Suggestions are off. Type a city or venue manually, or use your location to attach private coordinates.",
      ),
    ).toBeInTheDocument();

    await user.type(screen.getByRole("combobox", { name: "Location" }), "York");
    await user.click(screen.getByRole("button", { name: "Use my location" }));

    await waitFor(() =>
      expect(screen.getByTestId("selected-location")).toHaveTextContent(
        '"lat":53.959',
      ),
    );
    expect(screen.getByTestId("selected-location")).toHaveTextContent(
      '"address":"York"',
    );
    expect(screen.getByRole("combobox", { name: "Location" })).toHaveValue(
      "York",
    );
  });

  it("keeps Google attribution inside the custom accessible listbox", () => {
    const suggestion = createSuggestion();
    render(
      <AddressSuggestionsPanel
        activeSuggestionIndex={0}
        listRef={createRef()}
        onActiveSuggestionChange={vi.fn<
          AddressSuggestionsPanelProps["onActiveSuggestionChange"]
        >()}
        onPredictionSelect={vi.fn<
          AddressSuggestionsPanelProps["onPredictionSelect"]
        >()}
        onScroll={vi.fn<AddressSuggestionsPanelProps["onScroll"]>()}
        onScrollSuggestions={vi.fn<
          AddressSuggestionsPanelProps["onScrollSuggestions"]
        >()}
        optionRefs={{ current: new Map() }}
        panelRef={createRef()}
        panelStyle={{ left: 0, position: "fixed", top: 0, width: 280 }}
        portalTarget={document.body}
        scrollState={{ canScrollDown: false, canScrollUp: false }}
        suggestions={[suggestion]}
        suggestionsId="location-suggestions"
      />,
    );

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /York Minster/u }),
    ).toHaveAttribute("aria-selected", "true");
    const attribution = screen.getByLabelText("Google Maps");
    expect(attribution).toHaveTextContent("Google Maps");
    expect(attribution).toHaveAttribute("translate", "no");
  });
});

function ProviderOffHarness() {
  const [location, setLocation] = useState<HarnessLocation | null>(null);

  return (
    <>
      <AddressAutocomplete value={location} onLocationSelect={setLocation} />
      <output data-testid="selected-location">
        {JSON.stringify(location)}
      </output>
    </>
  );
}

function createSuggestion() {
  const place: GooglePlace = {
    fetchFields: () => Promise.resolve(),
  };

  return {
    description: "York Minster, York, UK",
    id: "place-1",
    mainText: "York Minster",
    prediction: {
      placeId: "place-1",
      text: { toString: () => "York Minster, York, UK" },
      toPlace: () => place,
    },
    secondaryText: "York, UK",
  };
}
