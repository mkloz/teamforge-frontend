import { describe, expect, it } from "vitest";
import {
  buildSettingsNavigation,
  validateSettingsRouteSearch,
} from "@/shared/navigation/settings-navigation";

describe("settings navigation", () => {
  it("distinguishes the mobile list from explicit Account detail", () => {
    expect(buildSettingsNavigation()).toMatchObject({
      search: undefined,
      to: "/settings",
    });
    expect(buildSettingsNavigation("account")).toMatchObject({
      search: { section: "account" },
      to: "/settings",
    });
  });

  it("keeps every valid explicit section and rejects invalid values", () => {
    expect(validateSettingsRouteSearch({ section: "security" })).toEqual({
      section: "security",
    });
    expect(validateSettingsRouteSearch({ section: "unknown" })).toEqual({
      section: undefined,
    });
  });
});
