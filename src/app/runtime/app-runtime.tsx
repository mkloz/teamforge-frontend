import { AppErrorListeners } from "@/app/runtime/app-error-listeners";
import { AppRealtimeSync } from "@/app/runtime/app-realtime-sync";
import { AppRoutePreloadRuntime } from "@/app/runtime/app-route-preload-runtime";
import { AuthSessionRedirect } from "@/app/runtime/auth-session-redirect";
import { PwaRuntime } from "@/app/runtime/pwa-runtime";
import { ThemePreferencesRuntime } from "@/app/runtime/theme-preferences-runtime";

export function AppRuntime() {
  return (
    <>
      <AppErrorListeners />
      <PwaRuntime />
      <AuthSessionRedirect />
      <ThemePreferencesRuntime />
      <AppRoutePreloadRuntime />
      <AppRealtimeSync />
    </>
  );
}
