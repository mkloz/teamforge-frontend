import type {
  DiagnosticIconTones,
  DiagnosticItemRule,
  DiagnosticItemState,
  DiagnosticStatusTones,
  NonActiveServiceWorkerStatus,
  PushDiagnosticsState,
} from "./types";

export const DIAGNOSTIC_ICON_TONES: DiagnosticIconTones = {
  blocked: "destructive",
  neutral: "muted",
  ready: "teal",
  warning: "amber",
};

export const DIAGNOSTIC_STATUS_TONES: DiagnosticStatusTones = {
  blocked: "destructive",
  neutral: "muted",
  ready: "teal",
  warning: "amber",
};

export const DIAGNOSTIC_CHECK_COUNT = 8;

export const ACTIVE_SERVICE_WORKER_ITEM_STATES: Record<
  "controlled" | "ready-after-reload",
  DiagnosticItemState
> = {
  controlled: {
    detail:
      "This page is currently controlled by the TeamForge service worker.",
    tone: "ready",
    value: "Active",
  },
  "ready-after-reload": {
    detail:
      "The service worker is active. Reload once if this page is not controlled yet.",
    tone: "warning",
    value: "Ready after reload",
  },
};

export const SERVICE_WORKER_ITEM_STATES: Record<
  NonActiveServiceWorkerStatus,
  DiagnosticItemState
> = {
  checking: {
    detail: "TeamForge is checking the active service worker for this origin.",
    tone: "neutral",
    value: "Checking",
  },
  error: {
    detail: "TeamForge could not read service-worker state for this origin.",
    tone: "blocked",
    value: "Check failed",
  },
  installing: {
    detail:
      "The browser is installing the service worker for offline launches.",
    tone: "neutral",
    value: "Installing",
  },
  "not-registered": {
    detail: "No TeamForge service worker is registered for this origin yet.",
    tone: "blocked",
    value: "Not registered",
  },
  unsupported: {
    detail:
      "This browser cannot run service workers, so install and offline support are limited.",
    tone: "blocked",
    value: "Unsupported",
  },
  waiting: {
    detail:
      "A newer service worker is waiting. Use the update toast or reload after activation.",
    tone: "warning",
    value: "Update waiting",
  },
};

export const BACKEND_PUSH_ITEM_RULES: readonly DiagnosticItemRule<PushDiagnosticsState>[] =
  [
    {
      shouldUse: (push) => !push.isOnline || push.isPublicKeyNetworkError,
      state: {
        detail: "Reconnect to check the backend public-key endpoint.",
        tone: "warning",
        value: "Offline",
      },
    },
    {
      shouldUse: (push) => push.isPublicKeyLoading,
      state: {
        detail: "Checking the backend public-key endpoint.",
        tone: "neutral",
        value: "Checking",
      },
    },
    {
      shouldUse: (push) => push.isPublicKeyError,
      state: {
        detail:
          "The backend public-key endpoint could not be reached from this device.",
        tone: "blocked",
        value: "Unavailable",
      },
    },
    {
      shouldUse: (push) => push.isWebPushEnabled,
      state: {
        detail:
          "The backend is returning a VAPID public key for this environment.",
        tone: "ready",
        value: "Enabled",
      },
    },
  ];

export const BACKEND_PUSH_FALLBACK_ITEM_STATE: DiagnosticItemState = {
  detail:
    "The app can still install, but push delivery is disabled in this environment.",
  tone: "warning",
  value: "Disabled",
};

export const SUBSCRIPTION_ITEM_RULES: readonly DiagnosticItemRule<PushDiagnosticsState>[] =
  [
    {
      shouldUse: (push) => !push.isAuthenticated,
      state: {
        detail:
          "Sign in on this device to check or create a push subscription.",
        tone: "neutral",
        value: "Sign in to check",
      },
    },
    {
      shouldUse: (push) => !push.isOnline,
      state: {
        detail:
          "Reconnect to verify this browser's subscription against TeamForge.",
        tone: "warning",
        value: "Offline",
      },
    },
    {
      shouldUse: (push) => push.isCheckingBrowserSubscription,
      state: {
        detail: "Reading this browser's active push subscription.",
        tone: "neutral",
        value: "Checking",
      },
    },
    {
      shouldUse: (push) => push.isSubscribed,
      state: {
        detail:
          "This browser subscription is active and linked to your account.",
        tone: "ready",
        value: "Linked",
      },
    },
    {
      shouldUse: (push) => Boolean(push.browserEndpoint),
      state: {
        detail:
          "The browser has a subscription, but it is not active on the backend.",
        tone: "warning",
        value: "Browser only",
      },
    },
  ];

export const SUBSCRIPTION_FALLBACK_ITEM_STATE: DiagnosticItemState = {
  detail: "This browser is not subscribed to TeamForge push notifications.",
  tone: "neutral",
  value: "Not subscribed",
};
