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
  const preferencesQuery = useQuery({
    ...SettingsQueryFactory.notificationPreferences(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!preferencesQuery.data) {
      return;
    }

    setThemePreferences({
      themeAppearance: preferencesQuery.data.themeAppearance,
      themeStyle: preferencesQuery.data.themeStyle,
      themeColor: preferencesQuery.data.themeColor,
    });
  }, [preferencesQuery.data, setThemePreferences]);

  return null;
}
