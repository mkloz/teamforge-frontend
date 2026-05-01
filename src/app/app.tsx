import { RouterProvider } from "@tanstack/react-router";

import { router } from "@/router";
import { AppErrorListeners } from "@/app/runtime/app-error-listeners";
import { AppRealtimeSync } from "@/app/runtime/app-realtime-sync";
import { AuthSessionRedirect } from "@/app/runtime/auth-session-redirect";
import { AppProviders } from "@/shared/providers/app-providers";

export function App() {
  return (
    <AppProviders>
      <AppErrorListeners />
      <AuthSessionRedirect />
      <AppRealtimeSync />
      <RouterProvider router={router} />
    </AppProviders>
  );
}
