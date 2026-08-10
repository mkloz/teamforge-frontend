import type { ParsedHistoryState } from "@tanstack/history";
import { describe, expect, it } from "vitest";

import {
  isCurrentHistoryLayerEntry,
  resolveHistoryLayerDismissal,
  withHistoryLayerEntry,
  withoutHistoryLayerEntry,
} from "@/shared/navigation/history-layer";

function createHistoryState(
  overrides: Partial<ParsedHistoryState> = {},
): ParsedHistoryState {
  return {
    __TSR_index: 4,
    __TSR_key: "parent-entry",
    ...overrides,
  };
}

describe("history layer provenance", () => {
  it("adds JSON-safe provenance while preserving TanStack state", () => {
    const previousState = createHistoryState({ key: "legacy-key" });
    const nextState = withHistoryLayerEntry(previousState, "notifications");

    expect(nextState).toEqual({
      ...previousState,
      findafewHistoryLayer: {
        id: "notifications",
        parentKey: "parent-entry",
        version: 1,
      },
    });
    expect(JSON.parse(JSON.stringify(nextState))).toEqual(nextState);
    expect(structuredClone(nextState)).toEqual(nextState);
  });

  it("replaces only the marker for a nested history entry", () => {
    const notificationState = withHistoryLayerEntry(
      createHistoryState(),
      "notifications",
    );
    const detailState = withHistoryLayerEntry(
      { ...notificationState, __TSR_key: "notifications-entry" },
      "notification-detail",
    );

    expect(detailState.findafewHistoryLayer).toEqual({
      id: "notification-detail",
      parentKey: "notifications-entry",
      version: 1,
    });
  });

  it("removes the marker without removing Router-owned fields", () => {
    const markedState = withHistoryLayerEntry(
      createHistoryState(),
      "settings-detail",
    );

    expect(withoutHistoryLayerEntry(markedState)).toEqual(createHistoryState());
  });

  it.each([
    null,
    {},
    { findafewHistoryLayer: null },
    { findafewHistoryLayer: { id: "unknown", parentKey: null, version: 1 } },
    {
      findafewHistoryLayer: {
        id: "notifications",
        parentKey: { unsafe: true },
        version: 1,
      },
    },
    {
      findafewHistoryLayer: {
        id: "notifications",
        parentKey: null,
        version: 2,
      },
    },
  ])("rejects malformed or mismatched state: %j", (state) => {
    expect(isCurrentHistoryLayerEntry(state, "notifications")).toBe(false);
  });

  it("uses Back only for the exact owned top entry", () => {
    const state = withHistoryLayerEntry(createHistoryState(), "activity-panel");

    expect(
      resolveHistoryLayerDismissal({
        canGoBack: true,
        id: "activity-panel",
        state,
      }),
    ).toBe("back");
    expect(
      resolveHistoryLayerDismissal({
        canGoBack: false,
        id: "activity-panel",
        state,
      }),
    ).toBe("replace");
    expect(
      resolveHistoryLayerDismissal({
        canGoBack: true,
        id: "settings-detail",
        state,
      }),
    ).toBe("replace");
  });
});
