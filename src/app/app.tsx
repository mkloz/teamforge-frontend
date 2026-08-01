import { RouterProvider } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { AppRuntime } from "@/app/runtime/app-runtime";
import { router } from "@/router";
import { AppProviders } from "@/shared/providers/app-providers";

interface AppProps {
  DevelopmentTools?: ComponentType | null;
}

export function App({ DevelopmentTools = null }: AppProps = {}) {
  return (
    <AppProviders>
      <AppRuntime />
      <RouterProvider router={router} />
      {DevelopmentTools ? <DevelopmentTools /> : null}
    </AppProviders>
  );
}
