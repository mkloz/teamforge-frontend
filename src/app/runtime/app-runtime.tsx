import { RouteModulePrefetcher } from "@/app/router/route-module-prefetcher";
import { AppErrorListeners } from "@/app/runtime/app-error-listeners";
import { AppRealtimeSync } from "@/app/runtime/app-realtime-sync";
import { AuthSessionRedirect } from "@/app/runtime/auth-session-redirect";
import { lazyRouteModules } from "@/router";

export function AppRuntime() {
  return (
    <>
      <AppErrorListeners />
      <AuthSessionRedirect />
      <AppRealtimeSync />
      <RouteModulePrefetcher modules={lazyRouteModules} />
    </>
  );
}
