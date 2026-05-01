import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { config } from "@/config/config";
import { appQueryClient } from "@/shared/api/query-client";
import { useInitializeTheme } from "@/shared/store/theme.store";

export function AppProviders({ children }: { children: ReactNode }) {
  useInitializeTheme();

  const app = (
    <QueryClientProvider client={appQueryClient}>
      {children}
      <Toaster richColors position="top-right" closeButton />
      <Analytics />
    </QueryClientProvider>
  );

  if (!config.googleClientId) {
    return app;
  }

  return (
    <GoogleOAuthProvider clientId={config.googleClientId}>
      {app}
    </GoogleOAuthProvider>
  );
}
