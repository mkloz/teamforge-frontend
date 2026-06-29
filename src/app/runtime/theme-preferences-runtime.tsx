import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { SettingsQueryFactory } from "@/features/settings/api/settings-query-factory";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { useThemeStore } from "@/shared/store/theme.store";

export function ThemePreferencesRuntime() {
  const { isAuthenticated } = useAuthSessionState();
  const setThemePreferences = useThemeStore(
    (state) => state.setThemePreferences,
  );
  const { data: preferences } = useQuery({
    ...SettingsQueryFactory.notificationPreferences(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!preferences) {
      return;
    }

    setThemePreferences({
      themeAppearance: preferences.themeAppearance,
      themeStyle: preferences.themeStyle,
      themeColor: preferences.themeColor,
    });
  }, [preferences, setThemePreferences]);

  return null;
}
