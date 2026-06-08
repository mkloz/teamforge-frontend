import {
  AppWindow,
  BellRing,
  Download,
  KeyRound,
  type LucideIcon,
  RadioTower,
  RefreshCw,
  Server,
  Smartphone,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { IconTile, type IconTileTone } from "@/shared/components/ui/icon-tile";
import {
  StatusPill,
  type StatusPillTone,
} from "@/shared/components/ui/status-pill";
import { usePwaDisplayMode } from "@/shared/hooks/use-pwa-display-mode";
import { usePwaInstallPrompt } from "@/shared/hooks/use-pwa-install-prompt";
import { useServiceWorkerDiagnostics } from "@/shared/hooks/use-service-worker-diagnostics";
import { useWebPushSubscription } from "@/shared/hooks/use-web-push-subscription";
import { recordPwaServiceWorkerUpdate } from "@/shared/lib/pwa-runtime-diagnostics";
import { trackPwaServiceWorkerUpdateCheck } from "@/shared/lib/pwa-telemetry";
import { cn } from "@/shared/lib/utils";

type DiagnosticTone = "blocked" | "neutral" | "ready" | "warning";

interface DiagnosticAction {
  disabled?: boolean;
  icon?: LucideIcon;
  label: string;
  loading?: boolean;
  onClick: () => void;
}

interface DiagnosticItem {
  action?: DiagnosticAction;
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: DiagnosticTone;
  value: string;
}

const DIAGNOSTIC_ICON_TONES: Record<DiagnosticTone, IconTileTone> = {
  blocked: "destructive",
  neutral: "muted",
  ready: "teal",
  warning: "amber",
};

const DIAGNOSTIC_STATUS_TONES: Record<DiagnosticTone, StatusPillTone> = {
  blocked: "destructive",
  neutral: "muted",
  ready: "teal",
  warning: "amber",
};

const DIAGNOSTIC_CHECK_COUNT = 8;

function getServiceWorkerItem(
  serviceWorker: ReturnType<typeof useServiceWorkerDiagnostics>,
): DiagnosticItem {
  if (serviceWorker.status === "active") {
    return {
      detail: serviceWorker.isControlled
        ? "This page is currently controlled by the TeamForge service worker."
        : "The service worker is active. Reload once if this page is not controlled yet.",
      icon: Wifi,
      label: "Service worker",
      tone: serviceWorker.isControlled ? "ready" : "warning",
      value: serviceWorker.isControlled ? "Active" : "Ready after reload",
    };
  }

  if (serviceWorker.status === "waiting") {
    return {
      detail:
        "A newer service worker is waiting. Use the update toast or reload after activation.",
      icon: Wifi,
      label: "Service worker",
      tone: "warning",
      value: "Update waiting",
    };
  }

  if (serviceWorker.status === "installing") {
    return {
      detail:
        "The browser is installing the service worker for offline launches.",
      icon: Wifi,
      label: "Service worker",
      tone: "neutral",
      value: "Installing",
    };
  }

  if (serviceWorker.status === "not-registered") {
    return {
      detail: "No TeamForge service worker is registered for this origin yet.",
      icon: Wifi,
      label: "Service worker",
      tone: "blocked",
      value: "Not registered",
    };
  }

  if (serviceWorker.status === "unsupported") {
    return {
      detail:
        "This browser cannot run service workers, so install and offline support are limited.",
      icon: Wifi,
      label: "Service worker",
      tone: "blocked",
      value: "Unsupported",
    };
  }

  if (serviceWorker.status === "error") {
    return {
      detail: "TeamForge could not read service-worker state for this origin.",
      icon: Wifi,
      label: "Service worker",
      tone: "blocked",
      value: "Check failed",
    };
  }

  return {
    detail: "TeamForge is checking the active service worker for this origin.",
    icon: Wifi,
    label: "Service worker",
    tone: "neutral",
    value: "Checking",
  };
}

function getPushSupportItem(
  push: ReturnType<typeof useWebPushSubscription>,
): DiagnosticItem {
  if (push.support.isSupported) {
    return {
      detail: "This browser supports service-worker push subscriptions.",
      icon: RadioTower,
      label: "Push support",
      tone: "ready",
      value: "Supported",
    };
  }

  const reason = push.support.reason.replaceAll("-", " ");

  return {
    detail: `Push cannot start here because of ${reason}.`,
    icon: RadioTower,
    label: "Push support",
    tone: "blocked",
    value: "Unavailable",
  };
}

function getPermissionItem(
  push: ReturnType<typeof useWebPushSubscription>,
): DiagnosticItem {
  if (push.permission === "granted") {
    return {
      detail: "The browser can show TeamForge system notifications.",
      icon: BellRing,
      label: "Permission",
      tone: "ready",
      value: "Granted",
    };
  }

  if (push.permission === "denied") {
    return {
      detail: "Notifications are blocked in this browser's site settings.",
      icon: BellRing,
      label: "Permission",
      tone: "blocked",
      value: "Blocked",
    };
  }

  if (push.permission === "unsupported") {
    return {
      detail: "This browser does not expose notification permission.",
      icon: BellRing,
      label: "Permission",
      tone: "blocked",
      value: "Unsupported",
    };
  }

  return {
    detail: "Permission has not been requested on this device yet.",
    icon: BellRing,
    label: "Permission",
    tone: "neutral",
    value: "Not requested",
  };
}

function getBackendPushItem(
  push: ReturnType<typeof useWebPushSubscription>,
): DiagnosticItem {
  if (!push.isOnline || push.isPublicKeyNetworkError) {
    return {
      detail: "Reconnect to check the backend public-key endpoint.",
      icon: Server,
      label: "Backend push",
      tone: "warning",
      value: "Offline",
    };
  }

  if (push.isPublicKeyLoading) {
    return {
      detail: "Checking the backend public-key endpoint.",
      icon: Server,
      label: "Backend push",
      tone: "neutral",
      value: "Checking",
    };
  }

  if (push.isPublicKeyError) {
    return {
      detail:
        "The backend public-key endpoint could not be reached from this device.",
      icon: Server,
      label: "Backend push",
      tone: "blocked",
      value: "Unavailable",
    };
  }

  if (push.isWebPushEnabled) {
    return {
      detail:
        "The backend is returning a VAPID public key for this environment.",
      icon: Server,
      label: "Backend push",
      tone: "ready",
      value: "Enabled",
    };
  }

  return {
    detail:
      "The app can still install, but push delivery is disabled in this environment.",
    icon: Server,
    label: "Backend push",
    tone: "warning",
    value: "Disabled",
  };
}

function getSubscriptionItem(
  push: ReturnType<typeof useWebPushSubscription>,
): DiagnosticItem {
  if (!push.isAuthenticated) {
    return {
      detail: "Sign in on this device to check or create a push subscription.",
      icon: Smartphone,
      label: "This device",
      tone: "neutral",
      value: "Sign in to check",
    };
  }

  if (!push.isOnline) {
    return {
      detail:
        "Reconnect to verify this browser's subscription against TeamForge.",
      icon: Smartphone,
      label: "This device",
      tone: "warning",
      value: "Offline",
    };
  }

  if (push.isCheckingBrowserSubscription) {
    return {
      detail: "Reading this browser's active push subscription.",
      icon: Smartphone,
      label: "This device",
      tone: "neutral",
      value: "Checking",
    };
  }

  if (push.isSubscribed) {
    return {
      detail: "This browser subscription is active and linked to your account.",
      icon: Smartphone,
      label: "This device",
      tone: "ready",
      value: "Linked",
    };
  }

  if (push.browserEndpoint) {
    return {
      detail:
        "The browser has a subscription, but it is not active on the backend.",
      icon: Smartphone,
      label: "This device",
      tone: "warning",
      value: "Browser only",
    };
  }

  return {
    detail: "This browser is not subscribed to TeamForge push notifications.",
    icon: Smartphone,
    label: "This device",
    tone: "neutral",
    value: "Not subscribed",
  };
}

function getInstallPromptItem(
  canPromptInstall: boolean,
  isStandalone: boolean,
): DiagnosticItem {
  if (isStandalone) {
    return {
      detail: "TeamForge is already running in app mode on this device.",
      icon: Download,
      label: "Install prompt",
      tone: "ready",
      value: "Installed",
    };
  }

  if (canPromptInstall) {
    return {
      detail: "This browser is offering the native install prompt.",
      icon: Download,
      label: "Install prompt",
      tone: "ready",
      value: "Available",
    };
  }

  return {
    detail:
      "Use the device-specific instructions above if the native prompt is not exposed.",
    icon: Download,
    label: "Install prompt",
    tone: "neutral",
    value: "Manual path",
  };
}

function getSecureContextItem(isSecureContext: boolean | null): DiagnosticItem {
  if (isSecureContext === null) {
    return {
      detail:
        "Checking whether this page is running in a secure browser context.",
      icon: KeyRound,
      label: "Secure context",
      tone: "neutral",
      value: "Checking",
    };
  }

  if (isSecureContext) {
    return {
      detail:
        "HTTPS or localhost is active, so service workers and push can run.",
      icon: KeyRound,
      label: "Secure context",
      tone: "ready",
      value: "Ready",
    };
  }

  return {
    detail:
      "Use HTTPS in production. Browsers block install and push APIs on insecure origins.",
    icon: KeyRound,
    label: "Secure context",
    tone: "blocked",
    value: "Needs HTTPS",
  };
}

export function PwaDiagnosticsPanel() {
  const { isStandalone } = usePwaDisplayMode();
  const { canPromptInstall } = usePwaInstallPrompt();
  const serviceWorker = useServiceWorkerDiagnostics();
  const push = useWebPushSubscription();
  const [isSecureContext, setIsSecureContext] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setIsSecureContext(window.isSecureContext);
  }, []);

  const diagnostics: DiagnosticItem[] = [
    {
      detail: isStandalone
        ? "The app is running without browser chrome."
        : "The app is running in a browser tab.",
      icon: AppWindow,
      label: "Display mode",
      tone: isStandalone ? "ready" : "neutral",
      value: isStandalone ? "Standalone" : "Browser",
    },
    getInstallPromptItem(canPromptInstall, isStandalone),
    getSecureContextItem(isSecureContext),
    getServiceWorkerItem(serviceWorker),
    getPushSupportItem(push),
    getPermissionItem(push),
    getBackendPushItem(push),
    getSubscriptionItem(push),
  ];

  async function handleRefreshDiagnostics() {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);

    trackPwaServiceWorkerUpdateCheck({
      isControlled: serviceWorker.isControlled,
      serviceWorkerStatus: serviceWorker.status,
      source: "download-diagnostics",
      status: "started",
    });
    recordPwaServiceWorkerUpdate("running", "manual update check");

    try {
      const serviceWorkerRefresh = push.isOnline
        ? serviceWorker.checkForUpdate()
        : serviceWorker.refresh();
      const [serviceWorkerResult] = await Promise.allSettled([
        serviceWorkerRefresh,
        push.refreshBrowserSubscription(),
      ]);

      if (serviceWorkerResult.status !== "fulfilled") {
        recordPwaServiceWorkerUpdate("error", "manual update check");
        trackPwaServiceWorkerUpdateCheck({
          source: "download-diagnostics",
          status: "error",
        });
        return;
      }

      if (serviceWorkerResult.value.status === "error") {
        recordPwaServiceWorkerUpdate("error", "manual update check");
      } else {
        recordPwaServiceWorkerUpdate(
          "success",
          `manual check: ${serviceWorkerResult.value.status}`,
        );
      }
      trackPwaServiceWorkerUpdateCheck({
        isControlled: serviceWorkerResult.value.isControlled,
        serviceWorkerStatus: serviceWorkerResult.value.status,
        source: "download-diagnostics",
        status: "success",
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <section
      aria-labelledby="pwa-diagnostics-title"
      className="border-border/70 border-y bg-background"
    >
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-semibold text-forge-teal text-xs">
              Device readiness
            </p>
            <div className="flex items-center justify-between gap-4">
              <h2
                id="pwa-diagnostics-title"
                className="font-extrabold text-2xl text-ink sm:text-3xl"
              >
                PWA diagnostics
              </h2>
              <Button
                aria-label="Refresh diagnostics"
                className="shrink-0 rounded-full sm:hidden"
                loading={isRefreshing}
                onClick={() => {
                  void handleRefreshDiagnostics();
                }}
                size="icon"
                variant="outline"
              >
                <RefreshCw size={17} strokeWidth={2} aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-2 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
              Use these checks on the actual device before install, offline, or
              push notification QA.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="hidden min-h-11 sm:inline-flex lg:min-h-9"
            loading={isRefreshing}
            onClick={() => {
              void handleRefreshDiagnostics();
            }}
          >
            <RefreshCw size={15} strokeWidth={2} aria-hidden="true" />
            Refresh checks
          </Button>
        </div>

        <ul
          className="mt-8 grid bg-transparent sm:grid-cols-2 lg:grid-cols-4"
          data-diagnostic-count={DIAGNOSTIC_CHECK_COUNT}
        >
          {diagnostics.map((item, index) => (
            <DiagnosticRow
              index={index}
              item={item}
              key={item.label}
              total={diagnostics.length}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function getDiagnosticCellBorderClasses(index: number, total: number) {
  const isBeforeLastSmRow = isBeforeLastGridRow(index, total, 2);
  const isBeforeLastLgRow = isBeforeLastGridRow(index, total, 4);

  return cn(
    index < total - 1 ? "border-b" : "border-b-0",
    isBeforeLastGridColumn(index, total, 2) ? "sm:border-r" : "sm:border-r-0",
    isBeforeLastSmRow ? "sm:border-b" : "sm:border-b-0",
    isBeforeLastGridColumn(index, total, 4) ? "lg:border-r" : "lg:border-r-0",
    isBeforeLastLgRow ? "lg:border-b" : "lg:border-b-0",
  );
}

function isBeforeLastGridColumn(index: number, total: number, columns: number) {
  const rowStart = Math.floor(index / columns) * columns;
  const itemsInRow = Math.min(columns, total - rowStart);

  return index - rowStart < itemsInRow - 1;
}

function isBeforeLastGridRow(index: number, total: number, columns: number) {
  const lastRowItemCount = total % columns || columns;
  const lastRowStart = total - lastRowItemCount;

  return index < lastRowStart;
}

function DiagnosticRow({
  index,
  item,
  total,
}: {
  index: number;
  item: DiagnosticItem;
  total: number;
}) {
  const Icon = item.icon;

  return (
    <li
      className={cn(
        "min-w-0 border-border/70 bg-transparent p-4 transition-colors duration-200 hover:bg-canvas/50 sm:p-5 dark:border-slate-muted/25 hover:dark:bg-background/40",
        getDiagnosticCellBorderClasses(index, total),
      )}
    >
      <div className="flex items-start gap-3">
        <IconTile
          bordered
          icon={Icon}
          shape="circle"
          size="lg"
          tone={DIAGNOSTIC_ICON_TONES[item.tone]}
          iconClassName="size-4"
        />
        <div className="min-w-0">
          <p className="font-semibold text-ink text-sm">{item.label}</p>
          <StatusPill
            size="xs"
            tone={DIAGNOSTIC_STATUS_TONES[item.tone]}
            className="mt-1 max-w-full px-2 py-0.5 text-xs"
          >
            {item.value}
          </StatusPill>
        </div>
      </div>
      <p className="mt-3 text-pretty text-slate-muted text-sm leading-relaxed">
        {item.detail}
      </p>
      {item.action ? <DiagnosticActionButton action={item.action} /> : null}
    </li>
  );
}

function DiagnosticActionButton({ action }: { action: DiagnosticAction }) {
  const ActionIcon = action.icon;

  return (
    <Button
      className="mt-4 min-h-10"
      disabled={action.disabled}
      loading={action.loading}
      onClick={action.onClick}
      size="sm"
      variant="outline"
    >
      {ActionIcon ? (
        <ActionIcon size={15} strokeWidth={2} aria-hidden="true" />
      ) : null}
      {action.label}
    </Button>
  );
}
