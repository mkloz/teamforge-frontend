import { scenarioRuntime } from "virtual:scenario-runtime";
import { AppErrorListeners } from "@/app/runtime/app-error-listeners";
import { AppRealtimeSync } from "@/app/runtime/app-realtime-sync";
import { AuthSessionRedirect } from "@/app/runtime/auth-session-redirect";
import { PwaRuntime } from "@/app/runtime/pwa-runtime";
import { RouteFocusRuntime } from "@/app/runtime/route-focus-runtime";
import { ScrollEntryRuntime } from "@/app/runtime/scroll-entry-runtime";
import { ThemePreferencesRuntime } from "@/app/runtime/theme-preferences-runtime";

export function AppRuntime() {
  return (
    <>
      <AppErrorListeners />
      {scenarioRuntime.allows("pwa") ? <PwaRuntime /> : null}
      <AuthSessionRedirect />
      <RouteFocusRuntime />
      <ScrollEntryRuntime />
      <ThemePreferencesRuntime />
      {scenarioRuntime.allows("realtime") ? <AppRealtimeSync /> : null}
    </>
  );
}
