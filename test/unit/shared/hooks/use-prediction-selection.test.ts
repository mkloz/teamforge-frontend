// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/lib/maps/google-places-service", () => ({
  resolvePlaceSuggestion:
    vi.fn<(suggestion: GooglePlaceSuggestion) => Promise<LocationValue>>(),
}));

import { usePredictionSelection } from "@/shared/hooks/address-autocomplete/use-prediction-selection";
import { resolvePlaceSuggestion } from "@/shared/lib/maps/google-places-service";
import type {
  GooglePlaceSuggestion,
  LocationValue,
} from "@/shared/lib/maps/location.types";

type PredictionSelectionInput = Parameters<typeof usePredictionSelection>[0];

const YORK_LOCATION: LocationValue = {
  address: "Deangate, York YO1 7HH, UK",
  city: "York",
  lat: 53.9623,
  lng: -1.0819,
  placeId: "place-1",
};

describe("usePredictionSelection", () => {
  afterEach(() => vi.clearAllMocks());

  it("consumes the autocomplete session and applies a current selection", async () => {
    vi.mocked(resolvePlaceSuggestion).mockResolvedValue(YORK_LOCATION);
    const harness = renderPredictionSelection();

    await act(() =>
      harness.result.current.selectPrediction(createSuggestion("place-1")),
    );

    expect(harness.endPlacesSession).toHaveBeenCalledOnce();
    expect(harness.invalidateSuggestionRequests).toHaveBeenCalledOnce();
    expect(harness.onLocationSelect).toHaveBeenCalledWith(YORK_LOCATION);
    expect(harness.result.current.isResolvingPlace).toBe(false);
  });

  it.each([
    "clear",
    "manual edit",
    "native geolocation",
    "provider disable or error",
    "reset",
  ])("ignores a deferred completion after %s invalidation", async () => {
    const pending = deferred<LocationValue>();
    vi.mocked(resolvePlaceSuggestion).mockReturnValue(pending.promise);
    const harness = renderPredictionSelection();
    let selection!: Promise<void>;

    act(() => {
      selection = harness.result.current.selectPrediction(
        createSuggestion("place-1"),
      );
    });
    expect(harness.result.current.isResolvingPlace).toBe(true);

    await act(async () => {
      harness.result.current.invalidatePredictionResolution();
    });
    await act(async () => {
      pending.resolve(YORK_LOCATION);
      await selection;
    });

    expect(harness.onLocationSelect).not.toHaveBeenCalled();
    expect(harness.showMessage).not.toHaveBeenCalled();
    expect(harness.result.current.isResolvingPlace).toBe(false);
  });

  it("ignores a deferred completion after unmount", async () => {
    const pending = deferred<LocationValue>();
    vi.mocked(resolvePlaceSuggestion).mockReturnValue(pending.promise);
    const harness = renderPredictionSelection();
    let selection!: Promise<void>;

    act(() => {
      selection = harness.result.current.selectPrediction(
        createSuggestion("place-1"),
      );
    });
    harness.unmount();

    pending.resolve(YORK_LOCATION);
    await selection;

    expect(harness.onLocationSelect).not.toHaveBeenCalled();
    expect(harness.showMessage).not.toHaveBeenCalled();
  });

  it("lets a newer selection supersede an older deferred resolution", async () => {
    const first = deferred<LocationValue>();
    const second = deferred<LocationValue>();
    const londonLocation: LocationValue = {
      address: "London, UK",
      city: "London",
      lat: 51.5072,
      lng: -0.1276,
      placeId: "place-2",
    };
    vi.mocked(resolvePlaceSuggestion)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const harness = renderPredictionSelection();
    let firstSelection!: Promise<void>;
    let secondSelection!: Promise<void>;

    act(() => {
      firstSelection = harness.result.current.selectPrediction(
        createSuggestion("place-1"),
      );
      secondSelection = harness.result.current.selectPrediction(
        createSuggestion("place-2"),
      );
    });

    await act(async () => {
      first.resolve(YORK_LOCATION);
      await firstSelection;
    });
    expect(harness.onLocationSelect).not.toHaveBeenCalled();
    expect(harness.result.current.isResolvingPlace).toBe(true);

    await act(async () => {
      second.resolve(londonLocation);
      await secondSelection;
    });
    expect(harness.onLocationSelect).toHaveBeenCalledOnce();
    expect(harness.onLocationSelect).toHaveBeenCalledWith(londonLocation);
    expect(harness.result.current.isResolvingPlace).toBe(false);
  });

  it("ignores a stale provider rejection without replacing current UI state", async () => {
    const pending = deferred<LocationValue>();
    vi.mocked(resolvePlaceSuggestion).mockReturnValue(pending.promise);
    const harness = renderPredictionSelection();
    let selection!: Promise<void>;

    act(() => {
      selection = harness.result.current.selectPrediction(
        createSuggestion("place-1"),
      );
      harness.result.current.invalidatePredictionResolution();
    });
    pending.reject(new Error("provider unavailable"));
    await selection;

    expect(harness.showMessage).not.toHaveBeenCalled();
    expect(harness.onLocationSelect).not.toHaveBeenCalled();
  });
});

function renderPredictionSelection() {
  const endPlacesSession = vi.fn<() => void>();
  const invalidateSuggestionRequests = vi.fn<() => void>();
  const onLocationSelect = vi.fn<(value: LocationValue) => void>();
  const showMessage = vi.fn<PredictionSelectionInput["showMessage"]>();
  const hook = renderHook(() =>
    usePredictionSelection({
      clearMessage: vi.fn<() => void>(),
      closeSuggestions: vi.fn<() => void>(),
      endPlacesSession,
      externalInputValue: "York",
      hasTypedInSessionRef: { current: true },
      invalidateSuggestionRequests,
      onLocationSelect,
      resetSuggestions: vi.fn<() => void>(),
      setDraftInput: vi.fn<PredictionSelectionInput["setDraftInput"]>(),
      setHasCurrentAreaError:
        vi.fn<PredictionSelectionInput["setHasCurrentAreaError"]>(),
      showMessage,
      skipPredictionsForValueRef: { current: null },
    }),
  );

  return {
    ...hook,
    endPlacesSession,
    invalidateSuggestionRequests,
    onLocationSelect,
    showMessage,
  };
}

function createSuggestion(placeId: string): GooglePlaceSuggestion {
  return {
    description: `${placeId} result`,
    id: placeId,
    mainText: placeId,
    prediction: {
      placeId,
      text: { toString: () => `${placeId} result` },
      toPlace: () => ({ fetchFields: () => Promise.resolve() }),
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, reject, resolve };
}
