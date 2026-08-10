// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  clearKeyboardViewportSnapshot,
  getKeyboardViewportSnapshot,
  isKeyboardViewportEditable,
  isKeyboardViewportUnzoomed,
  KEYBOARD_VIEWPORT_CSS_VARIABLES,
  writeKeyboardViewportSnapshot,
} from "@/shared/lib/keyboard-viewport";

describe("keyboard viewport geometry", () => {
  it("clamps geometry and accounts for a nonzero visual viewport offset", () => {
    expect(
      getKeyboardViewportSnapshot({
        layoutHeight: 800,
        viewport: { height: 470, offsetTop: 30, scale: 1 },
      }),
    ).toEqual({ bottomInset: 300, height: 470, offsetTop: 30, scale: 1 });
    expect(
      getKeyboardViewportSnapshot({
        layoutHeight: 400,
        viewport: { height: 450, offsetTop: -5, scale: 1 },
      }).bottomInset,
    ).toBe(0);
  });

  it("distinguishes editable controls from non-text controls", () => {
    const text = document.createElement("input");
    const date = document.createElement("input");
    date.type = "date";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    const textarea = document.createElement("textarea");
    const select = document.createElement("select");
    const editable = document.createElement("div");
    editable.contentEditable = "true";

    expect(isKeyboardViewportEditable(text)).toBe(true);
    expect(isKeyboardViewportEditable(date)).toBe(true);
    expect(isKeyboardViewportEditable(textarea)).toBe(true);
    expect(isKeyboardViewportEditable(select)).toBe(true);
    expect(isKeyboardViewportEditable(editable)).toBe(true);
    expect(isKeyboardViewportEditable(checkbox)).toBe(false);
    expect(isKeyboardViewportEditable(document.createElement("button"))).toBe(
      false,
    );
  });

  it("rejects zoom and writes only bounded CSS geometry", () => {
    const shell = document.createElement("div");
    const snapshot = getKeyboardViewportSnapshot({
      layoutHeight: 700,
      viewport: { height: 420.126, offsetTop: 10.125, scale: 1 },
    });

    expect(isKeyboardViewportUnzoomed(1)).toBe(true);
    expect(isKeyboardViewportUnzoomed(1.2)).toBe(false);
    writeKeyboardViewportSnapshot(shell, snapshot);
    expect(
      shell.style.getPropertyValue(KEYBOARD_VIEWPORT_CSS_VARIABLES.height),
    ).toBe("420.13px");
    expect(
      shell.style.getPropertyValue(KEYBOARD_VIEWPORT_CSS_VARIABLES.bottomInset),
    ).toBe("269.75px");

    clearKeyboardViewportSnapshot(shell);
    expect(shell.getAttribute("style")).toBe("");
  });
});
