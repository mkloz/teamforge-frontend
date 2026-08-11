// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSettingsMobileDetail } from "@/features/settings/settings-page/use-settings-mobile-detail";
import { withHistoryLayerEntry } from "@/shared/navigation";

const BASE_STATE = {
  __TSR_index: 0,
  __TSR_key: "settings-list",
};

describe("useSettingsMobileDetail", () => {
  it("derives visibility from an explicit route section", async () => {
    const { result, rerender } = renderHook(
      ({ explicitSection }: { explicitSection: "appearance" | null }) =>
        useSettingsMobileDetail({
          activeSection: explicitSection ?? "account",
          currentLocation: { state: BASE_STATE },
          explicitSection,
          getHistorySnapshot: () => ({
            canGoBack: true,
            state: BASE_STATE,
          }),
          onBack: vi.fn<() => void>(),
          onReplaceWithList: vi.fn<() => void>(),
        }),
      { initialProps: { explicitSection: null } },
    );

    expect(result.current.isMobileDetailOpen).toBe(false);
    await act(async () => result.current.openMobileDetail("appearance"));
    expect(result.current.isMobileDetailOpen).toBe(false);

    rerender({ explicitSection: "appearance" });
    expect(result.current.isMobileDetailOpen).toBe(true);
  });

  it("uses Back only for an owned, back-capable detail entry", async () => {
    const onBack = vi.fn<() => void>();
    const onReplaceWithList = vi.fn<() => void>();
    const markedState = withHistoryLayerEntry(BASE_STATE, "settings-detail");
    const { result } = renderHook(() =>
      useSettingsMobileDetail({
        activeSection: "appearance",
        currentLocation: { state: markedState },
        explicitSection: "appearance",
        getHistorySnapshot: () => ({ canGoBack: true, state: markedState }),
        onBack,
        onReplaceWithList,
      }),
    );

    await act(async () => result.current.closeMobileDetail());

    expect(onBack).toHaveBeenCalledOnce();
    expect(onReplaceWithList).not.toHaveBeenCalled();
  });

  it.each([
    { canGoBack: true, state: BASE_STATE },
    {
      canGoBack: false,
      state: withHistoryLayerEntry(BASE_STATE, "settings-detail"),
    },
  ])("replaces a cold or non-back-capable detail", async ({
    canGoBack,
    state,
  }) => {
    const onBack = vi.fn<() => void>();
    const onReplaceWithList = vi.fn<() => void>();
    const { result } = renderHook(() =>
      useSettingsMobileDetail({
        activeSection: "security",
        currentLocation: { state },
        explicitSection: "security",
        getHistorySnapshot: () => ({ canGoBack, state }),
        onBack,
        onReplaceWithList,
      }),
    );

    await act(async () => result.current.closeMobileDetail());

    expect(onBack).not.toHaveBeenCalled();
    expect(onReplaceWithList).toHaveBeenCalledOnce();
  });
});
