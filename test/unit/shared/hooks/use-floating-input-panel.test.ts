// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";

import { getFloatingPanelPortalTarget } from "@/shared/hooks/use-floating-input-panel";

describe("getFloatingPanelPortalTarget", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("keeps a floating panel inside its active dialog", () => {
    const dialog = document.createElement("div");
    const trigger = document.createElement("div");

    dialog.setAttribute("role", "dialog");
    dialog.append(trigger);
    document.body.append(dialog);

    expect(getFloatingPanelPortalTarget(trigger)).toBe(dialog);
  });

  it("uses the document body outside a dialog", () => {
    const trigger = document.createElement("div");
    document.body.append(trigger);

    expect(getFloatingPanelPortalTarget(trigger)).toBe(document.body);
  });
});
