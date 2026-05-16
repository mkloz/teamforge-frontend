import { AppErrorListeners } from "@/app/runtime/app-error-listeners";
import { AppRealtimeSync } from "@/app/runtime/app-realtime-sync";
import { AuthSessionRedirect } from "@/app/runtime/auth-session-redirect";

export function AppRuntime() {
  return (
    <>
      <AppErrorListeners />
      <AuthSessionRedirect />
      <AppRealtimeSync />
    </>
  );
}
