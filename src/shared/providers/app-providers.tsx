import { QueryClientProvider } from "@tanstack/react-query";
import {
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ToasterProps } from "sonner";

import { appQueryClient } from "@/shared/api/query-client";
import {
  addBrowserWindowEventListener,
  hasBrowserWindow,
} from "@/shared/lib/browser-environment";
import {
  cancelIdleTask,
  scheduleIdleTask,
} from "@/shared/lib/browser-scheduling";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import { APP_TOAST_HOST_REQUEST_EVENT } from "@/shared/lib/toast-host-events";
import { useInitializeTheme, useThemeStore } from "@/shared/store/theme.store";

type ToasterCssProperties = CSSProperties & Record<`--${string}`, string>;
const TOASTER_STYLE = {
  "--border-radius": "0.5rem",
  "--error-bg": "color-mix(in srgb, var(--destructive) 8%, var(--card))",
  "--error-border": "var(--destructive)",
  "--error-text": "color-mix(in srgb, var(--destructive) 78%, var(--ink))",
  "--info-bg": "color-mix(in srgb, var(--primary) 6%, var(--card))",
  "--info-border": "var(--primary)",
  "--info-text": "color-mix(in srgb, var(--primary) 78%, var(--ink))",
  "--normal-bg": "var(--card)",
  "--normal-border": "var(--border)",
  "--normal-text": "var(--foreground)",
  "--success-bg": "color-mix(in srgb, var(--primary) 8%, var(--card))",
  "--success-border": "var(--primary)",
  "--success-text": "color-mix(in srgb, var(--primary) 78%, var(--ink))",
  "--warning-bg": "color-mix(in srgb, var(--accent) 10%, var(--card))",
  "--warning-border": "var(--accent)",
  "--warning-text": "color-mix(in srgb, var(--accent) 70%, var(--ink))",
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
      actionButton:
        "col-start-2! mt-0.5! flex! h-9! w-full! justify-self-stretch! items-center! justify-center! gap-2! rounded-md! border-2! border-primary! bg-primary! px-4! font-bold! text-primary-foreground! text-sm! leading-none! shadow-button-primary! transition-all! duration-150! ease-out! hover:-translate-y-0.5! hover:shadow-button-primary! focus-visible:ring-2! focus-visible:ring-primary! focus-visible:ring-offset-2! focus-visible:ring-offset-card! active:translate-y-0! active:shadow-none! sm:w-fit! sm:justify-self-end!",
      closeButton:
        "border-current bg-card font-bold text-current transition-colors hover:bg-background",
      content: "min-w-0 gap-1 pr-2",
      description: "font-medium text-current text-sm leading-5",
      icon: "mt-0.5",
      title: "text-pretty font-black text-sm leading-5",
      toast:
        "grid! grid-cols-[auto_minmax(0,1fr)]! items-start! gap-x-3! gap-y-3! rounded-lg! border! p-4! shadow-2xl! shadow-black/12!",
    },
  },
} satisfies ToasterProps;

async function loadToasterComponent() {
  const { Toaster } = await import("sonner");
  const ToasterComponent: ComponentType<ToasterProps> = Toaster;

  return ToasterComponent;
}

export function AppProviders({ children }: { children: ReactNode }) {
  useInitializeTheme();

  return (
    <QueryClientProvider client={appQueryClient}>
      {children}
      <DeferredToaster />
    </QueryClientProvider>
  );
}

function DeferredToaster() {
  const theme = useThemeStore((state) => state.theme);
  const [ToasterComponent, setToasterComponent] =
    useState<ComponentType<ToasterProps> | null>(null);
  const shouldRequestToasterRef = useRef(true);

  useEffect(() => {
    if (!hasBrowserWindow() || ToasterComponent) {
      return undefined;
    }

    let cancelled = false;
    let idleTask: ReturnType<typeof scheduleIdleTask> | undefined;

    async function loadToaster() {
      try {
        const Toaster = await loadToasterComponent();

        if (!cancelled) {
          setToasterComponent(() => Toaster);
        }
      } catch (error) {
        warnInDevelopment("Toast provider failed to initialize.", error);
      }
    }

    function requestToaster() {
      if (!shouldRequestToasterRef.current) {
        return;
      }

      shouldRequestToasterRef.current = false;
      idleTask = scheduleIdleTask(() => {
        void loadToaster();
      });
    }

    const cleanupRequestListener = addBrowserWindowEventListener(
      APP_TOAST_HOST_REQUEST_EVENT,
      requestToaster,
    );

    return () => {
      cancelled = true;
      cleanupRequestListener();
      if (idleTask) {
        cancelIdleTask(idleTask);
      }
    };
  }, [ToasterComponent]);

  return ToasterComponent ? (
    <ToasterComponent {...TOASTER_PROPS} theme={theme} />
  ) : null;
}
