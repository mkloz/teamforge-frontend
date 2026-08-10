// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import { focusRenderedRoute } from "@/app/runtime/route-focus-runtime";
import { withRouteFocusReturn } from "@/shared/navigation/route-focus";

afterEach(() => {
  document.body.replaceChildren();
});

describe("route focus runtime", () => {
  it("focuses the explicit destination target without scrolling", () => {
    const heading = document.createElement("h1");
    heading.tabIndex = -1;
    heading.dataset.routeFocusTarget = "";
    document.body.append(heading);
    const focus = vi.spyOn(heading, "focus");

    expect(
      focusRenderedRoute({
        fromLocation: { state: historyState(1) },
        toLocation: { state: historyState(2) },
      }),
    ).toBe(true);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("restores the exact source on Back", () => {
    const source = document.createElement("a");
    source.href = "/groups/42";
    source.dataset.routeFocusKey = "explore-group:42";
    document.body.append(source);
    const focus = vi.spyOn(source, "focus");
    const detailState = withRouteFocusReturn(
      historyState(2),
      "explore-group:42",
    );

    expect(
      focusRenderedRoute({
        fromLocation: { state: detailState },
        toLocation: { state: historyState(1) },
      }),
    ).toBe(true);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("does not steal focus from a dialog-owned interaction", () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    const button = document.createElement("button");
    dialog.append(button);
    document.body.append(dialog);
    button.focus();

    expect(
      focusRenderedRoute({
        fromLocation: { state: historyState(1) },
        toLocation: { state: historyState(2) },
      }),
    ).toBe(false);
    expect(document.activeElement).toBe(button);
  });
});

function historyState(index: number) {
  return { __TSR_index: index, __TSR_key: `entry-${index}` };
}
