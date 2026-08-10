// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAutocompleteSuggestions } from "@/shared/hooks/address-autocomplete/use-autocomplete-suggestions";
import { createGooglePlacesSessionToken } from "@/shared/lib/maps/google-places-service";

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

describe("useAutocompleteSuggestions", () => {
  const fetchAutocompleteSuggestions =
    vi.fn<
      GooglePlacesLibrary["AutocompleteSuggestion"]["fetchAutocompleteSuggestions"]
    >();
  class SessionToken {}

  beforeEach(() => {
    vi.useFakeTimers();
    fetchAutocompleteSuggestions.mockReset();
    window.__findafewGooglePlacesLibrary = {
      AutocompleteSessionToken: SessionToken,
      AutocompleteSuggestion: { fetchAutocompleteSuggestions },
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    delete window.__findafewGooglePlacesLibrary;
  });

  it("keeps one token for a typing session and ignores a stale response", async () => {
    const first = deferred<{ suggestions: GoogleAutocompleteSuggestion[] }>();
    const second = deferred<{ suggestions: GoogleAutocompleteSuggestion[] }>();
    fetchAutocompleteSuggestions
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const hasTypedInSessionRef = { current: true };
    const sessionTokenRef = { current: createGooglePlacesSessionToken() };
    const skipPredictionsForValueRef = { current: null as string | null };
    const showMessage = vi.fn<(text: string, tone: "error" | "info") => void>();
    const { result, rerender } = renderHook(
      ({ inputValue }) =>
        useAutocompleteSuggestions({
          hasTypedInSessionRef,
          inputValue,
          isSettledResolvedValue: false,
          mapsReady: true,
          sessionTokenRef,
          showMessage,
          skipPredictionsForValueRef,
        }),
      { initialProps: { inputValue: "Yor" } },
    );

    await act(() => vi.advanceTimersByTimeAsync(250));
    rerender({ inputValue: "York" });
    await act(() => vi.advanceTimersByTimeAsync(250));

    await act(async () => {
      first.resolve({ suggestions: [createSuggestion("old", "Yorkshire")] });
      await first.promise;
    });
    expect(result.current.suggestions).toEqual([]);

    await act(async () => {
      second.resolve({
        suggestions: [createSuggestion("new", "York Minster")],
      });
      await second.promise;
    });
    expect(
      result.current.suggestions.map((suggestion) => suggestion.id),
    ).toEqual(["new"]);
    expect(fetchAutocompleteSuggestions).toHaveBeenCalledTimes(2);
    expect(fetchAutocompleteSuggestions.mock.calls[0]?.[0].sessionToken).toBe(
      fetchAutocompleteSuggestions.mock.calls[1]?.[0].sessionToken,
    );
    expect(showMessage).not.toHaveBeenCalled();
  });

  it("ends a failed session and leaves manual entry available", async () => {
    fetchAutocompleteSuggestions.mockRejectedValue(
      new Error("RESOURCE_EXHAUSTED: quota"),
    );
    const sessionTokenRef = { current: createGooglePlacesSessionToken() };
    const hasTypedInSessionRef = { current: true };
    const skipPredictionsForValueRef = { current: null as string | null };
    const showMessage = vi.fn<(text: string, tone: "error" | "info") => void>();

    const { result } = renderHook(() =>
      useAutocompleteSuggestions({
        hasTypedInSessionRef,
        inputValue: "York",
        isSettledResolvedValue: false,
        mapsReady: true,
        sessionTokenRef,
        showMessage,
        skipPredictionsForValueRef,
      }),
    );

    await act(() => vi.advanceTimersByTimeAsync(250));

    expect(result.current.suggestions).toEqual([]);
    expect(sessionTokenRef.current).toBeNull();
    expect(showMessage).toHaveBeenCalledWith(
      "Location suggestions are busy right now. Type the place manually, or try again in a moment.",
      "info",
    );
  });
});

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

function createSuggestion(
  placeId: string,
  text: string,
): GoogleAutocompleteSuggestion {
  return {
    placePrediction: {
      placeId,
      text: { toString: () => text },
      toPlace: () => ({ fetchFields: () => Promise.resolve() }),
    },
  };
}
