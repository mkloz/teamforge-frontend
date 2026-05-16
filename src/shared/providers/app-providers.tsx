import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ComponentType, type ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";

import { appQueryClient } from "@/shared/api/query-client";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import {
  cancelIdleTask,
  scheduleIdleTask,
} from "@/shared/lib/browser-scheduling";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import { useInitializeTheme } from "@/shared/store/theme.store";

export function AppProviders({ children }: { children: ReactNode }) {
  useInitializeTheme();

  return (
    <QueryClientProvider client={appQueryClient}>
      <TooltipProvider>{children}</TooltipProvider>
      {import.meta.env.DEV ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
      <Toaster
        closeButton
        position="top-right"
        visibleToasts={3}
        toastOptions={{
          classNames: {
            closeButton:
              "border-border bg-background text-muted-foreground hover:text-foreground",
            description: "font-medium text-muted-foreground text-sm",
            error: "border-destructive/25",
            title: "font-bold text-sm",
            toast:
              "rounded-xl border border-border bg-card text-foreground shadow-lg",
          },
        }}
      />
      <DeferredAnalytics />
    </QueryClientProvider>
  );
}

function DeferredAnalytics() {
  const [AnalyticsComponent, setAnalyticsComponent] =
    useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        const { Analytics } = await import("@vercel/analytics/react");

        if (!cancelled) {
          setAnalyticsComponent(() => Analytics);
        }
      } catch (error) {
        warnInDevelopment("Analytics failed to initialize.", error);
      }
    }

    const task = scheduleIdleTask(() => {
      void loadAnalytics();
    });

    return () => {
      cancelled = true;
      cancelIdleTask(task);
    };
  }, []);

  return AnalyticsComponent ? <AnalyticsComponent /> : null;
}
