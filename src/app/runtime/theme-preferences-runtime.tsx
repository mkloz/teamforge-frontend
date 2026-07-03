import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { settingsQueries } from "@/features/settings/api/settings-queries";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { useThemeStore } from "@/shared/store/theme.store";

export function ThemePreferencesRuntime() {
  const { isAuthenticated } = useAuthSessionState();
  const setThemePreferences = useThemeStore(
    (state) => state.setThemePreferences,
  );
  const { data: preferences } = useQuery({
    ...settingsQueries.notificationPreferences(),
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
