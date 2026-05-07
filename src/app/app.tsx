import { RouterProvider } from "@tanstack/react-router";

import { router } from "@/router";
import { AppRuntime } from "@/app/runtime/app-runtime";
import { DevTools } from "@/shared/components/dev/dev-tools";
import { AppProviders } from "@/shared/providers/app-providers";

export function App() {
  return (
    <AppProviders>
      <AppRuntime />
      <RouterProvider router={router} />
      <DevTools />
    </AppProviders>
  );
}
