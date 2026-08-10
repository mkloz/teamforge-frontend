// @vitest-environment jsdom

import { act, render, screen } from "@testing-library/react";
import { useReducedMotionConfig } from "framer-motion";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";

import { usePrefersReducedMotion } from "@/shared/hooks/use-prefers-reduced-motion";
import { OsMotionPreferenceProvider } from "@/shared/providers/os-motion-preference-provider";

class ProviderMediaQueryList extends EventTarget implements MediaQueryList {
  readonly media = "(prefers-reduced-motion: reduce)";
  onchange:
    | ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown)
    | null = null;
  matches: boolean;

  constructor(matches: boolean) {
    super();
    this.matches = matches;
  }

  addListener() {}
  removeListener() {}

  setMatches(matches: boolean) {
    this.matches = matches;
    this.dispatchEvent(
      Object.assign(new Event("change"), { matches, media: this.media }),
    );
  }
}

function MotionPreferenceProbe() {
  const osPreference = usePrefersReducedMotion();
  const motionPreference = useReducedMotionConfig();

  return (
    <output data-testid="motion-preference">
      {String(osPreference)}:{String(motionPreference)}
    </output>
  );
}

describe("OsMotionPreferenceProvider", () => {
  it("keeps project and Motion consumers synchronized on live OS changes", () => {
    const mediaQuery = new ProviderMediaQueryList(true);
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn<(query: string) => MediaQueryList>(() => mediaQuery),
    });

    render(
      <StrictMode>
        <OsMotionPreferenceProvider>
          <MotionPreferenceProbe />
        </OsMotionPreferenceProvider>
      </StrictMode>,
    );

    expect(screen.getByTestId("motion-preference")).toHaveTextContent(
      "true:true",
    );

    act(() => mediaQuery.setMatches(false));
    expect(screen.getByTestId("motion-preference")).toHaveTextContent(
      "false:false",
    );
  });
});
