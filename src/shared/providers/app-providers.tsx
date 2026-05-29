import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import type { ToasterProps } from "sonner";

import { appQueryClient } from "@/shared/api/query-client";
import {
  cancelIdleTask,
  scheduleIdleTask,
} from "@/shared/lib/browser-scheduling";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import { APP_TOAST_HOST_REQUEST_EVENT } from "@/shared/lib/toast-host-events";
import { useInitializeTheme, useThemeStore } from "@/shared/store/theme.store";

type ToasterCssProperties = CSSProperties & Record<`--${string}`, string>;

const TOASTER_STYLE = {
  "--border-radius": "0.75rem",
  "--error-bg": "color-mix(in srgb, var(--destructive) 8%, var(--card))",
  "--error-border": "var(--destructive)",
  "--error-text": "color-mix(in srgb, var(--destructive) 78%, var(--ink))",
  "--info-bg": "color-mix(in srgb, var(--color-forge-teal) 6%, var(--card))",
  "--info-border": "var(--color-forge-teal)",
  "--info-text": "color-mix(in srgb, var(--color-forge-teal) 78%, var(--ink))",
  "--normal-bg": "var(--card)",
  "--normal-border": "var(--border)",
  "--normal-text": "var(--foreground)",
  "--success-bg": "color-mix(in srgb, var(--color-forge-teal) 8%, var(--card))",
  "--success-border": "var(--color-forge-teal)",
  "--success-text":
    "color-mix(in srgb, var(--color-forge-teal) 78%, var(--ink))",
  "--warning-bg":
    "color-mix(in srgb, var(--color-spark-amber) 10%, var(--card))",
  "--warning-border": "var(--color-spark-amber)",
  "--warning-text":
    "color-mix(in srgb, var(--color-spark-amber) 70%, var(--ink))",
  fontFamily: "var(--font-sans)",
} satisfies ToasterCssProperties;

const TOASTER_PROPS = {
  closeButton: true,
  position: "top-right",
  richColors: true,
  style: TOASTER_STYLE,
  visibleToasts: 3,
  toastOptions: {
    classNames: {
      closeButton:
        "border-current bg-card font-bold text-current transition-colors hover:bg-background",
      content: "gap-1",
      description: "font-medium text-current text-sm leading-5",
      title: "font-black text-sm leading-5",
      toast: "rounded-xl border shadow-lg",
    },
  },
} satisfies ToasterProps;

function isPublicUnauthenticatedPathname(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname.startsWith("/auth/")
  );
}

function shouldWarmToaster(pathname: string) {
  return (
    !isPublicUnauthenticatedPathname(pathname) &&
    !pathname.startsWith("/onboarding/")
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  useInitializeTheme();

  return (
    <QueryClientProvider client={appQueryClient}>
      {children}
      {import.meta.env.DEV ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
      <DeferredToaster />
      <DeferredAnalytics />
    </QueryClientProvider>
  );
}

function DeferredToaster() {
  const theme = useThemeStore((state) => state.theme);
  const [ToasterComponent, setToasterComponent] =
    useState<ComponentType<ToasterProps> | null>(null);
  const [shouldLoadToaster, setShouldLoadToaster] = useState(
    () =>
      typeof window !== "undefined" &&
      shouldWarmToaster(window.location.pathname),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function requestToaster() {
      setShouldLoadToaster(true);
    }

    window.addEventListener(APP_TOAST_HOST_REQUEST_EVENT, requestToaster);

    return () => {
      window.removeEventListener(APP_TOAST_HOST_REQUEST_EVENT, requestToaster);
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadToaster || ToasterComponent) {
      return undefined;
    }

    let cancelled = false;

    async function loadToaster() {
      try {
        const { Toaster } = await import("sonner");

        if (!cancelled) {
          setToasterComponent(() => Toaster as ComponentType<ToasterProps>);
        }
      } catch (error) {
        warnInDevelopment("Toast provider failed to initialize.", error);
      }
    }

    const task = scheduleIdleTask(() => {
      void loadToaster();
    });

    return () => {
      cancelled = true;
      cancelIdleTask(task);
    };
  }, [shouldLoadToaster, ToasterComponent]);

  return ToasterComponent ? (
    <ToasterComponent {...TOASTER_PROPS} theme={theme} />
  ) : null;
}

function DeferredAnalytics() {
  const [AnalyticsComponent, setAnalyticsComponent] =
    useState<ComponentType | null>(null);

  useEffect(() => {
    if (window.location.hostname === "localhost") {
      return undefined;
    }

    if (window.location.hostname === "127.0.0.1") {
      return undefined;
    }

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
