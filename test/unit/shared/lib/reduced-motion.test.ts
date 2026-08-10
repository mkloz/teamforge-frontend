// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

class MockMediaQueryList extends EventTarget implements MediaQueryList {
  readonly media = "(prefers-reduced-motion: reduce)";
  onchange:
    | ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown)
    | null = null;
  matches: boolean;
  changeListenerCount = 0;

  private readonly legacyListeners = new Set<
    (this: MediaQueryList, ev: MediaQueryListEvent) => unknown
  >();

  constructor(matches: boolean) {
    super();
    this.matches = matches;
  }

  override addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (type === "change") {
      this.changeListenerCount += 1;
    }
    super.addEventListener(type, callback, options);
  }

  override removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ) {
    if (type === "change") {
      this.changeListenerCount -= 1;
    }
    super.removeEventListener(type, callback, options);
  }

  addListener(
    callback: (this: MediaQueryList, ev: MediaQueryListEvent) => unknown,
  ) {
    this.legacyListeners.add(callback);
  }

  removeListener(
    callback: (this: MediaQueryList, ev: MediaQueryListEvent) => unknown,
  ) {
    this.legacyListeners.delete(callback);
  }

  setMatches(matches: boolean) {
    if (matches === this.matches) {
      return;
    }

    this.matches = matches;
    const event = Object.assign(new Event("change"), {
      matches,
      media: this.media,
    });
    this.dispatchEvent(event);
    for (const listener of this.legacyListeners) {
      listener.call(this, event);
    }
  }
}

function installMatchMedia(mediaQuery: MediaQueryList) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn<(query: string) => MediaQueryList>(() => mediaQuery),
  });
}

describe("OS reduced-motion resolver", () => {
  it("resolves synchronously, updates live, and shares one listener", async () => {
    vi.resetModules();
    const mediaQuery = new MockMediaQueryList(false);
    installMatchMedia(mediaQuery);
    const { getPrefersReducedMotion, subscribeToPrefersReducedMotion } =
      await import("@/shared/lib/reduced-motion");

    expect(getPrefersReducedMotion()).toBe(false);

    const firstListener = vi.fn<() => void>();
    const secondListener = vi.fn<() => void>();
    const unsubscribeFirst = subscribeToPrefersReducedMotion(firstListener);
    const unsubscribeSecond = subscribeToPrefersReducedMotion(secondListener);

    expect(mediaQuery.changeListenerCount).toBe(1);
    mediaQuery.setMatches(true);
    expect(getPrefersReducedMotion()).toBe(true);
    expect(firstListener).toHaveBeenCalledTimes(1);
    expect(secondListener).toHaveBeenCalledTimes(1);

    mediaQuery.setMatches(true);
    expect(firstListener).toHaveBeenCalledTimes(1);

    unsubscribeFirst();
    expect(mediaQuery.changeListenerCount).toBe(1);
    unsubscribeSecond();
    expect(mediaQuery.changeListenerCount).toBe(0);
  });

  it("falls back safely when matchMedia is unavailable", async () => {
    vi.resetModules();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: undefined,
    });
    const { getPrefersReducedMotion, subscribeToPrefersReducedMotion } =
      await import("@/shared/lib/reduced-motion");

    expect(getPrefersReducedMotion()).toBe(false);
    expect(() =>
      subscribeToPrefersReducedMotion(() => undefined)(),
    ).not.toThrow();
  });
});
