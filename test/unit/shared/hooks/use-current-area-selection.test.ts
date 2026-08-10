// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/lib/maps/browser-geolocation", () => ({
  getCurrentCoordinates: vi.fn<() => Promise<{ lat: number; lng: number }>>(
    () => Promise.resolve({ lat: 53.959, lng: -1.081 }),
  ),
  isGeolocationAvailable: vi.fn<() => boolean>(() => true),
}));

import { useCurrentAreaSelection } from "@/shared/hooks/address-autocomplete/use-current-area-selection";
import { isGeolocationAvailable } from "@/shared/lib/maps/browser-geolocation";

type CurrentAreaSelectionInput = Parameters<typeof useCurrentAreaSelection>[0];

describe("useCurrentAreaSelection", () => {
  beforeEach(() => vi.mocked(isGeolocationAvailable).mockReturnValue(true));
  afterEach(() => vi.clearAllMocks());

  it("invalidates place resolution and ends its token before native geolocation", async () => {
    const harness = createHarness();

    await act(() => harness.result.current.useCurrentArea());

    expect(harness.invalidatePredictionResolution).toHaveBeenCalledOnce();
    expect(harness.invalidateSuggestionRequests).toHaveBeenCalledOnce();
    expect(harness.endPlacesSession).toHaveBeenCalledOnce();
    expect(harness.onLocationSelect).toHaveBeenCalledWith(
      expect.objectContaining({ lat: 53.959, lng: -1.081 }),
    );
  });

  it("still abandons the Places session when geolocation is unavailable", async () => {
    vi.mocked(isGeolocationAvailable).mockReturnValue(false);
    const harness = createHarness();

    await act(() => harness.result.current.useCurrentArea());

    expect(harness.invalidatePredictionResolution).toHaveBeenCalledOnce();
    expect(harness.invalidateSuggestionRequests).toHaveBeenCalledOnce();
    expect(harness.endPlacesSession).toHaveBeenCalledOnce();
    expect(harness.onLocationSelect).not.toHaveBeenCalled();
  });
});

function createHarness() {
  const endPlacesSession = vi.fn<() => void>();
  const invalidatePredictionResolution = vi.fn<() => void>();
  const invalidateSuggestionRequests = vi.fn<() => void>();
  const onLocationSelect =
    vi.fn<CurrentAreaSelectionInput["onLocationSelect"]>();
  const hook = renderHook(() =>
    useCurrentAreaSelection({
      currentLocation: null,
      endPlacesSession,
      hasTypedInSessionRef: { current: true },
      invalidatePredictionResolution,
      invalidateSuggestionRequests,
      onLocationSelect,
      resetSuggestions: vi.fn<CurrentAreaSelectionInput["resetSuggestions"]>(),
      setDraftInput: vi.fn<CurrentAreaSelectionInput["setDraftInput"]>(),
      setHasCurrentAreaError:
        vi.fn<CurrentAreaSelectionInput["setHasCurrentAreaError"]>(),
      showMessage: vi.fn<CurrentAreaSelectionInput["showMessage"]>(),
      skipPredictionsForValueRef: { current: null },
    }),
  );

  return {
    ...hook,
    endPlacesSession,
    invalidatePredictionResolution,
    invalidateSuggestionRequests,
    onLocationSelect,
  };
}
