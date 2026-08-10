// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAutocompleteSuggestions } from "@/shared/hooks/address-autocomplete/use-autocomplete-suggestions";
import { createGooglePlacesSessionToken } from "@/shared/lib/maps/google-places-service";

interface Deferred<T> {
  promise: Promise<T>;
  reject: (error: unknown) => void;
  resolve: (value: T) => void;
}

const SUGGESTION_ABANDONMENT_BOUNDARIES = [
  "Escape",
  "Tab",
  "outside pointer",
  "blur",
  "native location",
  "manual replacement",
  "clear",
  "provider off",
  "reset",
] as const;
const PRE_DISPATCH_ABANDONMENT_BOUNDARIES = [
  "Escape",
  "Tab",
  "outside focus",
  "outside pointer",
  "blur",
  "manual replacement",
  "clear",
  "native location",
  "provider off",
  "reset",
  "selection",
] as const;

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
    const requestGenerationRef = { current: 0 };
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
          requestGenerationRef,
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
    const requestGenerationRef = { current: 0 };
    const skipPredictionsForValueRef = { current: null as string | null };
    const showMessage = vi.fn<(text: string, tone: "error" | "info") => void>();

    const { result } = renderHook(() =>
      useAutocompleteSuggestions({
        hasTypedInSessionRef,
        inputValue: "York",
        isSettledResolvedValue: false,
        mapsReady: true,
        requestGenerationRef,
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

  it("creates a fresh token after an abandoned session", async () => {
    fetchAutocompleteSuggestions.mockResolvedValue({ suggestions: [] });
    const sessionTokenRef = {
      current: createGooglePlacesSessionToken(),
    };
    const hasTypedInSessionRef = { current: true };
    const requestGenerationRef = { current: 0 };
    const skipPredictionsForValueRef = { current: null as string | null };
    const { rerender } = renderHook(
      ({ inputValue }) =>
        useAutocompleteSuggestions({
          hasTypedInSessionRef,
          inputValue,
          isSettledResolvedValue: false,
          mapsReady: true,
          requestGenerationRef,
          sessionTokenRef,
          showMessage: vi.fn<(text: string, tone: "error" | "info") => void>(),
          skipPredictionsForValueRef,
        }),
      { initialProps: { inputValue: "York" } },
    );

    await act(() => vi.advanceTimersByTimeAsync(250));
    const firstToken =
      fetchAutocompleteSuggestions.mock.calls[0]?.[0].sessionToken;

    sessionTokenRef.current = null;
    rerender({ inputValue: "Yorks" });
    await act(() => vi.advanceTimersByTimeAsync(250));

    const secondToken =
      fetchAutocompleteSuggestions.mock.calls[1]?.[0].sessionToken;
    expect(firstToken).toBeInstanceOf(SessionToken);
    expect(secondToken).toBeInstanceOf(SessionToken);
    expect(secondToken).not.toBe(firstToken);
  });

  it.each(
    SUGGESTION_ABANDONMENT_BOUNDARIES.flatMap(
      (boundary) =>
        [
          [boundary, "success"],
          [boundary, "rejection"],
        ] as const,
    ),
  )("ignores pending %s request %s after immediate abandonment", async (_boundary, outcome) => {
    const pending = deferred<{
      suggestions: GoogleAutocompleteSuggestion[];
    }>();
    fetchAutocompleteSuggestions.mockReturnValue(pending.promise);
    const hasTypedInSessionRef = { current: true };
    const requestGenerationRef = { current: 0 };
    const sessionTokenRef = { current: createGooglePlacesSessionToken() };
    const skipPredictionsForValueRef = { current: null as string | null };
    const showMessage = vi.fn<(text: string, tone: "error" | "info") => void>();
    const { result } = renderHook(() =>
      useAutocompleteSuggestions({
        hasTypedInSessionRef,
        inputValue: "York",
        isSettledResolvedValue: false,
        mapsReady: true,
        requestGenerationRef,
        sessionTokenRef,
        showMessage,
        skipPredictionsForValueRef,
      }),
    );

    await act(() => vi.advanceTimersByTimeAsync(250));
    requestGenerationRef.current += 1;
    sessionTokenRef.current = null;

    await act(async () => {
      if (outcome === "success") {
        pending.resolve({
          suggestions: [createSuggestion("stale", "Stale result")],
        });
      } else {
        pending.reject(new Error("stale provider failure"));
      }
      await Promise.resolve();
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isSuggestionsOpen).toBe(false);
    expect(showMessage).not.toHaveBeenCalled();
    expect(sessionTokenRef.current).toBeNull();
  });

  it("keeps a fresh session token when an old request rejects", async () => {
    const first = deferred<{ suggestions: GoogleAutocompleteSuggestion[] }>();
    const second = deferred<{
      suggestions: GoogleAutocompleteSuggestion[];
    }>();
    fetchAutocompleteSuggestions
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const hasTypedInSessionRef = { current: true };
    const requestGenerationRef = { current: 0 };
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
          requestGenerationRef,
          sessionTokenRef,
          showMessage,
          skipPredictionsForValueRef,
        }),
      { initialProps: { inputValue: "York" } },
    );

    await act(() => vi.advanceTimersByTimeAsync(250));
    requestGenerationRef.current += 1;
    sessionTokenRef.current = null;
    rerender({ inputValue: "Yorks" });
    await act(() => vi.advanceTimersByTimeAsync(250));
    const freshToken = sessionTokenRef.current;

    await act(async () => {
      first.reject(new Error("old request failed"));
      await Promise.resolve();
    });

    expect(sessionTokenRef.current).toBe(freshToken);
    expect(showMessage).not.toHaveBeenCalled();

    await act(async () => {
      second.resolve({
        suggestions: [createSuggestion("new", "Fresh result")],
      });
      await second.promise;
    });
    expect(result.current.suggestions.map(({ id }) => id)).toEqual(["new"]);
  });

  it("clears a failed request token only when that token is still current", async () => {
    const pending = deferred<{ suggestions: GoogleAutocompleteSuggestion[] }>();
    fetchAutocompleteSuggestions.mockReturnValue(pending.promise);
    const hasTypedInSessionRef = { current: true };
    const requestGenerationRef = { current: 0 };
    const sessionTokenRef = { current: createGooglePlacesSessionToken() };
    const skipPredictionsForValueRef = { current: null as string | null };
    const { result } = renderHook(() =>
      useAutocompleteSuggestions({
        hasTypedInSessionRef,
        inputValue: "York",
        isSettledResolvedValue: false,
        mapsReady: true,
        requestGenerationRef,
        sessionTokenRef,
        showMessage: vi.fn<(text: string, tone: "error" | "info") => void>(),
        skipPredictionsForValueRef,
      }),
    );

    await act(() => vi.advanceTimersByTimeAsync(250));
    const replacementToken = createGooglePlacesSessionToken();
    sessionTokenRef.current = replacementToken;
    await act(async () => {
      pending.reject(new Error("current generation old token failed"));
      await Promise.resolve();
    });

    expect(sessionTokenRef.current).toBe(replacementToken);
    expect(result.current.suggestions).toEqual([]);
  });

  it.each(
    PRE_DISPATCH_ABANDONMENT_BOUNDARIES,
  )("does not dispatch after %s abandons during debounce and lets a fresh session work", async (_boundary) => {
    fetchAutocompleteSuggestions.mockResolvedValue({
      suggestions: [createSuggestion("fresh", "Fresh result")],
    });
    const hasTypedInSessionRef = { current: true };
    const requestGenerationRef = { current: 0 };
    const sessionTokenRef = { current: null } satisfies Parameters<
      typeof useAutocompleteSuggestions
    >[0]["sessionTokenRef"];
    const skipPredictionsForValueRef = { current: null as string | null };
    const showMessage = vi.fn<(text: string, tone: "error" | "info") => void>();
    const { result, rerender } = renderHook(
      ({ inputValue }) =>
        useAutocompleteSuggestions({
          hasTypedInSessionRef,
          inputValue,
          isSettledResolvedValue: false,
          mapsReady: true,
          requestGenerationRef,
          sessionTokenRef,
          showMessage,
          skipPredictionsForValueRef,
        }),
      { initialProps: { inputValue: "York" } },
    );

    requestGenerationRef.current += 1;
    await act(() => vi.advanceTimersByTimeAsync(250));

    expect(fetchAutocompleteSuggestions).not.toHaveBeenCalled();
    expect(sessionTokenRef.current).toBeNull();
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isSuggestionsOpen).toBe(false);
    expect(showMessage).not.toHaveBeenCalled();

    rerender({ inputValue: "Yorks" });
    await act(() => vi.advanceTimersByTimeAsync(250));

    expect(fetchAutocompleteSuggestions).toHaveBeenCalledOnce();
    expect(sessionTokenRef.current).toBeInstanceOf(SessionToken);
    expect(result.current.suggestions.map(({ id }) => id)).toEqual(["fresh"]);
  });

  it("does not dispatch after unmount during debounce", async () => {
    const hasTypedInSessionRef = { current: true };
    const requestGenerationRef = { current: 0 };
    const sessionTokenRef = { current: null } satisfies Parameters<
      typeof useAutocompleteSuggestions
    >[0]["sessionTokenRef"];
    const { unmount } = renderHook(() =>
      useAutocompleteSuggestions({
        hasTypedInSessionRef,
        inputValue: "York",
        isSettledResolvedValue: false,
        mapsReady: true,
        requestGenerationRef,
        sessionTokenRef,
        showMessage: vi.fn<(text: string, tone: "error" | "info") => void>(),
        skipPredictionsForValueRef: { current: null },
      }),
    );

    unmount();
    await act(() => vi.advanceTimersByTimeAsync(250));

    expect(fetchAutocompleteSuggestions).not.toHaveBeenCalled();
    expect(sessionTokenRef.current).toBeNull();
  });
});

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, reject, resolve };
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
