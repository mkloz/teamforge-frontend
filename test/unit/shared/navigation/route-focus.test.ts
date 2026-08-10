import type { ParsedHistoryState } from "@tanstack/history";
import { describe, expect, it } from "vitest";

import {
  createRouteFocusKey,
  getRouteFocusDirection,
  readRouteFocusReturn,
  withRouteFocusReturn,
} from "@/shared/navigation/route-focus";

function state(index: number): ParsedHistoryState {
  return { __TSR_index: index, __TSR_key: `entry-${index}` };
}

describe("route focus history state", () => {
  it("preserves Router state and remains serializable", () => {
    const marked = withRouteFocusReturn(
      state(2),
      createRouteFocusKey("explore-group", "group-42"),
    );

    expect(marked.__TSR_key).toBe("entry-2");
    expect(readRouteFocusReturn(marked)).toEqual({
      key: "explore-group:group-42",
      version: 1,
    });
    expect(structuredClone(marked)).toEqual(marked);
  });

  it.each([
    null,
    {},
    { findafewReturnFocus: null },
    { findafewReturnFocus: { key: "unsafe selector []", version: 1 } },
    { findafewReturnFocus: { key: "explore-group:1", version: 2 } },
  ])("rejects malformed focus provenance: %j", (value) => {
    expect(readRouteFocusReturn(value)).toBeNull();
  });

  it("classifies only a lower history index as Back", () => {
    expect(getRouteFocusDirection(state(3), state(2))).toBe("back");
    expect(getRouteFocusDirection(state(2), state(3))).toBe("forward");
    expect(getRouteFocusDirection(state(2), state(2))).toBe("forward");
    expect(getRouteFocusDirection({}, state(2))).toBe("forward");
  });

  it("rejects focus keys that could become arbitrary selectors or payloads", () => {
    expect(() => createRouteFocusKey("explore group", "42")).toThrow(
      "Route focus keys must be short, stable identifiers.",
    );
    expect(() => createRouteFocusKey("explore-group", "x".repeat(200))).toThrow(
      "Route focus keys must be short, stable identifiers.",
    );
  });
});
