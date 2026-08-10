// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const autocomplete = vi.hoisted(() => ({
  closeSuggestions: vi.fn<() => void>(),
  containerRef: { current: null as HTMLDivElement | null },
}));
const originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "scrollIntoView",
);

vi.mock("@/shared/hooks/use-address-autocomplete", () => ({
  useAddressAutocomplete: () => ({
    activeSuggestionIndex: 0,
    clearLocation: vi.fn<() => void>(),
    closeSuggestions: autocomplete.closeSuggestions,
    containerRef: autocomplete.containerRef,
    geolocationAvailable: true,
    handleInputChange: vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>(),
    handleInputFocus: vi.fn<(event: FocusEvent<HTMLInputElement>) => void>(),
    handleInputKeyDown:
      vi.fn<(event: KeyboardEvent<HTMLInputElement>) => void>(),
    hasCurrentAreaError: false,
    inputValue: "York",
    isLocating: false,
    isResolvingPlace: false,
    isSuggestionsOpen: true,
    mapsReady: true,
    mapsStatus: "ready",
    message: null,
    messageTone: null,
    resetInputDraft: vi.fn<() => void>(),
    selectPrediction: vi.fn<
      (suggestion: GooglePlaceSuggestion) => Promise<void>
    >(() => Promise.resolve()),
    setActiveSuggestionIndex: vi.fn<(index: number) => void>(),
    suggestions: [createSuggestion()],
    useCurrentArea: vi.fn<() => Promise<void>>(() => Promise.resolve()),
  }),
}));

import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";

describe("AddressAutocomplete dismissal lifecycle", () => {
  beforeEach(() => {
    autocomplete.closeSuggestions.mockClear();
    Element.prototype.scrollIntoView = vi.fn<() => void>();
  });

  afterEach(() => {
    if (originalScrollIntoViewDescriptor) {
      Object.defineProperty(
        Element.prototype,
        "scrollIntoView",
        originalScrollIntoViewDescriptor,
      );
      return;
    }

    Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  });

  it("abandons the session when input focus leaves the component and panel", () => {
    render(
      <AddressAutocomplete value={null} onLocationSelect={() => undefined} />,
    );

    fireEvent.blur(screen.getByRole("combobox", { name: "Location" }), {
      relatedTarget: null,
    });

    expect(autocomplete.closeSuggestions).toHaveBeenCalledOnce();
  });

  it("keeps the session while focus moves to a control inside the component", () => {
    render(
      <AddressAutocomplete value={null} onLocationSelect={() => undefined} />,
    );
    const clear = screen.getByRole("button", { name: "Clear location" });

    fireEvent.blur(screen.getByRole("combobox", { name: "Location" }), {
      relatedTarget: clear,
    });

    expect(autocomplete.closeSuggestions).not.toHaveBeenCalled();
  });

  it("abandons the session on an outside pointer dismissal", async () => {
    render(
      <AddressAutocomplete value={null} onLocationSelect={() => undefined} />,
    );
    await screen.findByRole("option", { name: /York Minster/u });

    fireEvent.pointerDown(document.body);

    await waitFor(() =>
      expect(autocomplete.closeSuggestions).toHaveBeenCalledOnce(),
    );
  });
});

function createSuggestion(): GooglePlaceSuggestion {
  return {
    description: "York Minster, York, UK",
    id: "place-1",
    mainText: "York Minster",
    prediction: {
      placeId: "place-1",
      text: { toString: () => "York Minster, York, UK" },
      toPlace: () => ({ fetchFields: () => Promise.resolve() }),
    },
    secondaryText: "York, UK",
  };
}
