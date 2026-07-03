import {
  AppWindow,
  BellRing,
  Download,
  KeyRound,
  type LucideIcon,
  RadioTower,
  Server,
  Smartphone,
  Wifi,
} from "lucide-react";

import type {
  DiagnosticItem,
  DiagnosticItemRule,
  DiagnosticItemState,
  PushDiagnosticsState,
  ServiceWorkerDiagnosticsState,
} from "@/features/download/components/pwa-diagnostics-panel/types";
import {
  ACTIVE_SERVICE_WORKER_ITEM_STATES,
  BACKEND_PUSH_FALLBACK_ITEM_STATE,
  BACKEND_PUSH_ITEM_RULES,
  SERVICE_WORKER_ITEM_STATES,
  SUBSCRIPTION_FALLBACK_ITEM_STATE,
  SUBSCRIPTION_ITEM_RULES,
} from "./diagnostic-copy";

interface DiagnosticItemsInput {
  canPromptInstall: boolean;
  isSecureContext: boolean;
  isStandalone: boolean;
  push: PushDiagnosticsState;
  serviceWorker: ServiceWorkerDiagnosticsState;
}

function createDiagnosticItem(
  icon: LucideIcon,
  label: string,
  state: DiagnosticItemState,
): DiagnosticItem {
  return {
    detail: state.detail,
    icon,
    label,
    tone: state.tone,
    value: state.value,
  };
}

function getFirstDiagnosticItemState<TInput>(
  rules: readonly DiagnosticItemRule<TInput>[],
  input: TInput,
  fallback: DiagnosticItemState,
) {
  return rules.find((rule) => rule.shouldUse(input))?.state ?? fallback;
}

function getActiveServiceWorkerItemState(isControlled: boolean) {
  return ACTIVE_SERVICE_WORKER_ITEM_STATES[
    isControlled ? "controlled" : "ready-after-reload"
  ];
}

function getServiceWorkerItem(
  serviceWorker: ServiceWorkerDiagnosticsState,
): DiagnosticItem {
  const state =
    serviceWorker.status === "active"
      ? getActiveServiceWorkerItemState(serviceWorker.isControlled)
      : SERVICE_WORKER_ITEM_STATES[serviceWorker.status];

  return createDiagnosticItem(Wifi, "Service worker", state);
}

function getPushSupportItem(push: PushDiagnosticsState): DiagnosticItem {
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

function getPermissionItem(push: PushDiagnosticsState): DiagnosticItem {
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

function getBackendPushItem(push: PushDiagnosticsState): DiagnosticItem {
  return createDiagnosticItem(
    Server,
    "Backend push",
    getFirstDiagnosticItemState(
      BACKEND_PUSH_ITEM_RULES,
      push,
      BACKEND_PUSH_FALLBACK_ITEM_STATE,
    ),
  );
}

function getSubscriptionItem(push: PushDiagnosticsState): DiagnosticItem {
  return createDiagnosticItem(
    Smartphone,
    "This device",
    getFirstDiagnosticItemState(
      SUBSCRIPTION_ITEM_RULES,
      push,
      SUBSCRIPTION_FALLBACK_ITEM_STATE,
    ),
  );
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

function getSecureContextItem(isSecureContext: boolean): DiagnosticItem {
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

function getDisplayModeItem(isStandalone: boolean): DiagnosticItem {
  return {
    detail: isStandalone
      ? "The app is running without browser chrome."
      : "The app is running in a browser tab.",
    icon: AppWindow,
    label: "Display mode",
    tone: isStandalone ? "ready" : "neutral",
    value: isStandalone ? "Standalone" : "Browser",
  };
}

export function getDiagnosticItems({
  canPromptInstall,
  isSecureContext,
  isStandalone,
  push,
  serviceWorker,
}: DiagnosticItemsInput): DiagnosticItem[] {
  return [
    getDisplayModeItem(isStandalone),
    getInstallPromptItem(canPromptInstall, isStandalone),
    getSecureContextItem(isSecureContext),
    getServiceWorkerItem(serviceWorker),
    getPushSupportItem(push),
    getPermissionItem(push),
    getBackendPushItem(push),
    getSubscriptionItem(push),
  ];
}
