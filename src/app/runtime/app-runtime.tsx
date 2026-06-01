import { AppErrorListeners } from "@/app/runtime/app-error-listeners";
import { AppRealtimeSync } from "@/app/runtime/app-realtime-sync";
import { AuthSessionRedirect } from "@/app/runtime/auth-session-redirect";
import { PwaRuntime } from "@/app/runtime/pwa-runtime";

export function AppRuntime() {
  return (
    <>
      <AppErrorListeners />
      <PwaRuntime />
      <AuthSessionRedirect />
      <AppRealtimeSync />
    </>
  );
}
