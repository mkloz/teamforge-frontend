// @vitest-environment jsdom

import { fireEvent, render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { useAddressAutocompleteActions } from "@/shared/hooks/address-autocomplete/use-address-autocomplete-actions";
import type { GooglePlaceSuggestion } from "@/shared/lib/maps/location.types";

type AddressAutocompleteActionsInput = Parameters<
  typeof useAddressAutocompleteActions
>[0];

describe("useAddressAutocompleteActions", () => {
  it("keeps one token while typing continues but invalidates stale selection work", () => {
    const harness = createHarness({ hasTypedInSession: true });

    fireEvent.change(harness.input, { target: { value: "York Minster" } });

    expect(harness.invalidatePredictionResolution).toHaveBeenCalledOnce();
    expect(harness.endPlacesSession).not.toHaveBeenCalled();
  });

  it("discards an old token before a manual replacement starts a new session", () => {
    const harness = createHarness({ hasTypedInSession: false });

    fireEvent.change(harness.input, { target: { value: "London" } });

    expect(harness.invalidatePredictionResolution).toHaveBeenCalledOnce();
    expect(harness.endPlacesSession).toHaveBeenCalledOnce();
    expect(harness.hasTypedInSessionRef.current).toBe(true);
  });

  it("invalidates resolution and ends the token on clear", () => {
    const harness = createHarness({ hasTypedInSession: true });

    harness.actions.clearLocation();

    expect(harness.invalidatePredictionResolution).toHaveBeenCalledOnce();
    expect(harness.endPlacesSession).toHaveBeenCalledOnce();
    expect(harness.hasTypedInSessionRef.current).toBe(false);
  });

  it.each([
    "Escape",
    "Tab",
  ])("routes %s through the session-ending dismiss boundary", (key) => {
    const harness = createHarness({ hasTypedInSession: true });

    fireEvent.keyDown(harness.input, { key });

    expect(harness.closeSuggestions).toHaveBeenCalledOnce();
    expect(harness.endPlacesSession).toHaveBeenCalledOnce();
  });
});

function createHarness({ hasTypedInSession }: { hasTypedInSession: boolean }) {
  const endPlacesSession = vi.fn<() => void>();
  const closeSuggestions = vi.fn<() => void>(() => endPlacesSession());
  const invalidatePredictionResolution = vi.fn<() => void>();
  const hasTypedInSessionRef = { current: hasTypedInSession };
  const suggestion = createSuggestion();
  const hook = renderHook(() =>
    useAddressAutocompleteActions({
      activeSuggestionIndex: -1,
      clearMessage: vi.fn<AddressAutocompleteActionsInput["clearMessage"]>(),
      closeSuggestions,
      endPlacesSession,
      externalInputValue: "York",
      hasTypedInSessionRef,
      invalidatePredictionResolution,
      isSuggestionsOpen: true,
      moveActiveSuggestion:
        vi.fn<AddressAutocompleteActionsInput["moveActiveSuggestion"]>(),
      onLocationSelect:
        vi.fn<AddressAutocompleteActionsInput["onLocationSelect"]>(),
      openSuggestions:
        vi.fn<AddressAutocompleteActionsInput["openSuggestions"]>(),
      requestGoogleMaps: vi.fn<
        AddressAutocompleteActionsInput["requestGoogleMaps"]
      >(() => Promise.resolve(true)),
      resetSuggestions:
        vi.fn<AddressAutocompleteActionsInput["resetSuggestions"]>(),
      selectPrediction: vi.fn<
        AddressAutocompleteActionsInput["selectPrediction"]
      >(() => Promise.resolve()),
      setDraftInput: vi.fn<AddressAutocompleteActionsInput["setDraftInput"]>(),
      setHasCurrentAreaError:
        vi.fn<AddressAutocompleteActionsInput["setHasCurrentAreaError"]>(),
      skipPredictionsForValueRef: { current: null },
      visibleSuggestions: [suggestion],
    }),
  );
  const rendered = render(
    createElement("input", {
      "aria-label": "Location",
      onChange: hook.result.current.handleInputChange,
      onKeyDown: hook.result.current.handleInputKeyDown,
    }),
  );

  return {
    actions: hook.result.current,
    closeSuggestions,
    endPlacesSession,
    hasTypedInSessionRef,
    input: rendered.getByRole("textbox", { name: "Location" }),
    invalidatePredictionResolution,
  };
}

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
  };
}
