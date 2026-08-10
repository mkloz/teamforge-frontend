// @vitest-environment jsdom

import { act, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useKeyboardSafeViewport } from "@/shared/hooks/use-keyboard-safe-viewport";
import { KEYBOARD_VIEWPORT_CSS_VARIABLES } from "@/shared/lib/keyboard-viewport";

class MockVisualViewport extends EventTarget {
  height = 780;
  offsetTop = 0;
  scale = 1;
  width = 390;
  offsetLeft = 0;
  pageLeft = 0;
  pageTop = 0;
  onresize = null;
  onscroll = null;
}

function KeyboardViewportHarness() {
  const ref = useRef<HTMLDivElement>(null);
  useKeyboardSafeViewport(ref);

  return (
    <div ref={ref} data-testid="shell">
      <input aria-label="Message" />
      <button type="button">Action</button>
    </div>
  );
}

describe("useKeyboardSafeViewport", () => {
  const callbacks = new Map<number, FrameRequestCallback>();
  let nextFrame = 1;
  let viewport: MockVisualViewport;

  function flushAnimationFrames() {
    const pending = [...callbacks.entries()];
    callbacks.clear();
    for (const [, callback] of pending) {
      callback(performance.now());
    }
  }

  beforeEach(() => {
    callbacks.clear();
    nextFrame = 1;
    viewport = new MockVisualViewport();
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: viewport,
    });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      configurable: true,
      value: 800,
    });
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      const id = nextFrame++;
      callbacks.set(id, callback);
      return id;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      callbacks.delete(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("coalesces viewport events and clears adaptation during zoom or blur", () => {
    render(<KeyboardViewportHarness />);
    act(flushAnimationFrames);
    const shell = screen.getByTestId("shell");
    const input = screen.getByRole("textbox", { name: "Message" });

    act(() => input.focus());
    expect(callbacks).toHaveLength(1);
    viewport.height = 500;
    viewport.offsetTop = 20;
    viewport.dispatchEvent(new Event("resize"));
    viewport.dispatchEvent(new Event("scroll"));
    expect(callbacks).toHaveLength(1);
    act(flushAnimationFrames);

    expect(
      shell.style.getPropertyValue(KEYBOARD_VIEWPORT_CSS_VARIABLES.height),
    ).toBe("500px");
    expect(
      shell.style.getPropertyValue(KEYBOARD_VIEWPORT_CSS_VARIABLES.bottomInset),
    ).toBe("280px");

    viewport.scale = 2;
    viewport.dispatchEvent(new Event("resize"));
    act(flushAnimationFrames);
    expect(
      shell.style.getPropertyValue(KEYBOARD_VIEWPORT_CSS_VARIABLES.height),
    ).toBe("");

    act(() => input.blur());
    act(flushAnimationFrames);
    viewport.dispatchEvent(new Event("resize"));
    expect(callbacks).toHaveLength(0);
  });

  it("is a safe no-op when VisualViewport is unavailable", () => {
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: undefined,
    });
    render(<KeyboardViewportHarness />);

    act(() => screen.getByRole("textbox", { name: "Message" }).focus());
    expect(screen.getByTestId("shell")).not.toHaveAttribute("style");
  });
});
