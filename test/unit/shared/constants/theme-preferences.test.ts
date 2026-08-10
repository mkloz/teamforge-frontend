import { describe, expect, it } from "vitest";

import {
  normalizeThemePreferences,
  ThemeAppearance,
  ThemeColor,
  ThemeStyle,
} from "@/shared/constants/theme-preferences";
import { notificationPreferencesSchema } from "@/shared/schemas/notification-preferences";

const accountAppearanceSchema = notificationPreferencesSchema.pick({
  themeAppearance: true,
  themeColor: true,
  themeStyle: true,
});

describe("theme preference migration", () => {
  it.each([
    ["acid", ThemeColor.MONO],
    ["cobalt", ThemeColor.MONO],
    ["coral", ThemeColor.EMBER],
    ["paper", ThemeColor.GRAPHITE],
    ["spruce", ThemeColor.TEAL],
    ["ultraviolet", ThemeColor.MONO],
  ])("maps the legacy %s palette to %s", (legacy, expected) => {
    expect(normalizeThemePreferences({ themeColor: legacy }).themeColor).toBe(
      expected,
    );
  });

  it("recovers invalid or outdated saved values with safe defaults", () => {
    expect(
      normalizeThemePreferences({
        themeAppearance: "midnight",
        themeColor: "electric-blue",
        themeStyle: "floating",
      }),
    ).toEqual({
      themeAppearance: ThemeAppearance.SYSTEM,
      themeColor: ThemeColor.GRAPHITE,
      themeStyle: ThemeStyle.CLASSIC,
    });
  });

  it("preserves every supported purpose-led preference", () => {
    expect(
      normalizeThemePreferences({
        themeAppearance: ThemeAppearance.DARK,
        themeColor: ThemeColor.HARBOR,
        themeStyle: ThemeStyle.POSTER,
      }),
    ).toEqual({
      themeAppearance: ThemeAppearance.DARK,
      themeColor: ThemeColor.HARBOR,
      themeStyle: ThemeStyle.POSTER,
    });
  });

  it("sanitizes outdated account-backed preferences at the API boundary", () => {
    expect(
      accountAppearanceSchema.parse({
        themeAppearance: "midnight",
        themeColor: "coral",
        themeStyle: "floating",
      }),
    ).toEqual({
      themeAppearance: ThemeAppearance.SYSTEM,
      themeColor: ThemeColor.EMBER,
      themeStyle: ThemeStyle.CLASSIC,
    });
  });
});
