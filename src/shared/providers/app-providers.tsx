import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Analytics } from "@vercel/analytics/react";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { config } from "@/config/config";
import { appQueryClient } from "@/shared/api/query-client";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { useInitializeTheme } from "@/shared/store/theme.store";

export function AppProviders({ children }: { children: ReactNode }) {
  useInitializeTheme();

  const app = (
    <QueryClientProvider client={appQueryClient}>
      <TooltipProvider>{children}</TooltipProvider>
      {import.meta.env.DEV ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
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
