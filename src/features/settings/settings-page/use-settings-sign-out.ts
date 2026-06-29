import { useCurrentSessionSignOut } from "@/shared/hooks/use-current-session-sign-out";
import type { buildRouteLocationHref } from "@/shared/lib/auth-route";

interface UseSettingsSignOutOptions {
  currentLocation: Parameters<typeof buildRouteLocationHref>[0];
}

export function useSettingsSignOut({
  currentLocation,
}: UseSettingsSignOutOptions) {
  return useCurrentSessionSignOut({ currentLocation });
}
