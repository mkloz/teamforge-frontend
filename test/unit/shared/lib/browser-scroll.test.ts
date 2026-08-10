// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPrefersReducedMotion } = vi.hoisted(() => ({
  getPrefersReducedMotion: vi.fn<() => boolean>(),
}));

vi.mock("@/shared/lib/reduced-motion", () => ({
  getPrefersReducedMotion,
}));

import {
  resolveProgrammaticScrollBehavior,
  scrollElementBy,
  scrollElementIntoView,
  scrollElementTo,
  scrollToPageTop,
} from "@/shared/lib/browser-scroll";

describe("reduced-aware programmatic scrolling", () => {
  beforeEach(() => {
    getPrefersReducedMotion.mockReset();
    getPrefersReducedMotion.mockReturnValue(false);
  });

  it.each([
    "reset",
    "restore",
    "reveal",
  ] as const)("keeps %s intent instant in either motion mode", (intent) => {
    expect(resolveProgrammaticScrollBehavior(intent)).toBe("instant");
    getPrefersReducedMotion.mockReturnValue(true);
    expect(resolveProgrammaticScrollBehavior(intent)).toBe("instant");
  });

  it.each([
    "locate",
    "follow",
  ] as const)("makes %s smooth only when the current OS preference allows it", (intent) => {
    expect(resolveProgrammaticScrollBehavior(intent)).toBe("smooth");
    getPrefersReducedMotion.mockReturnValue(true);
    expect(resolveProgrammaticScrollBehavior(intent)).toBe("instant");
    getPrefersReducedMotion.mockReturnValue(false);
    expect(resolveProgrammaticScrollBehavior(intent)).toBe("smooth");
  });

  it("defaults to an immediate reset", () => {
    expect(resolveProgrammaticScrollBehavior()).toBe("instant");
  });

  it("routes target, container, and window operations through the intent policy", () => {
    const target = document.createElement("div");
    const scrollIntoView =
      vi.fn<(options?: boolean | ScrollIntoViewOptions) => void>();
    const scrollBy = vi.fn<(options?: ScrollToOptions) => void>();
    const scrollTo = vi.fn<(options?: ScrollToOptions) => void>();
    const windowScrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);
    target.scrollIntoView = scrollIntoView;
    target.scrollBy = scrollBy;
    target.scrollTo = scrollTo;

    const intoViewOptions = {
      block: "center" as const,
      intent: "locate" as const,
    };
    scrollElementIntoView(target, intoViewOptions);
    scrollElementBy(target, { intent: "reveal", top: 24 });
    scrollElementTo(target, { intent: "restore", top: 48 });
    scrollToPageTop("locate");

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
    expect(scrollBy).toHaveBeenCalledWith({ behavior: "instant", top: 24 });
    expect(scrollTo).toHaveBeenCalledWith({ behavior: "instant", top: 48 });
    expect(windowScrollTo).toHaveBeenCalledWith({
      behavior: "smooth",
      top: 0,
    });
    expect(intoViewOptions).toEqual({ block: "center", intent: "locate" });
  });

  it("is a no-op for missing elements", () => {
    expect(() => {
      scrollElementIntoView(null, { intent: "locate" });
      scrollElementBy(null, { intent: "locate", top: 1 });
      scrollElementTo(null, { intent: "locate", top: 1 });
    }).not.toThrow();
  });
});
