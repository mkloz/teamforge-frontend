// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSettingsMobileDetail } from "@/features/settings/settings-page/use-settings-mobile-detail";
import type { SettingsSection } from "@/shared/navigation/settings-navigation";

describe("useSettingsMobileDetail", () => {
  it("keeps the mobile detail open while route search and section settle separately", async () => {
    const { result, rerender } = renderHook(
      ({
        activeSection,
        searchStr,
      }: {
        activeSection: SettingsSection;
        searchStr: string;
      }) =>
        useSettingsMobileDetail({
          activeSection,
          currentLocation: { searchStr },
        }),
      {
        initialProps: {
          activeSection: "account",
          searchStr: "",
        },
      },
    );

    await act(async () => result.current.openMobileDetail("appearance"));
    expect(result.current.isMobileDetailOpen).toBe(true);

    rerender({ activeSection: "account", searchStr: "?section=appearance" });
    expect(result.current.isMobileDetailOpen).toBe(true);

    rerender({ activeSection: "account", searchStr: "" });
    expect(result.current.isMobileDetailOpen).toBe(true);

    rerender({
      activeSection: "appearance",
      searchStr: "?section=appearance",
    });
    expect(result.current.isMobileDetailOpen).toBe(true);
  });
});
