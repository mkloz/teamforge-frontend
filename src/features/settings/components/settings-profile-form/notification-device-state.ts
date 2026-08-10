import type { StatusPillTone } from "@/shared/components/ui/status-pill";
import type { useWebPushSubscription } from "@/shared/hooks/use-web-push-subscription";

export type WebPushDeviceState = ReturnType<typeof useWebPushSubscription>;
export interface WebPushDeviceStatus {
  description: string;
  label: string;
  tone: "attention" | "muted" | "on";
}

export interface WebPushControlState {
  isBusy: boolean;
  isDisabled: boolean;
  sendTestDisabled: boolean;
  status: WebPushDeviceStatus;
  statusTone: StatusPillTone;
}

interface WebPushStatusRule {
  matches: (push: WebPushDeviceState) => boolean;
  status: WebPushDeviceStatus;
}

interface WebPushDisableReasons {
  appOffline: boolean;
  browserOffline: boolean;
  busy: boolean;
  cannotToggle: boolean;
  publicKeyLoading: boolean;
}

const WEB_PUSH_STATUS_RULES: WebPushStatusRule[] = [
  {
    matches: (push) => !push.support.isSupported,
    status: {
      label: "Unavailable",
      description: "Push notifications are not supported in this browser.",
      tone: "muted",
    },
  },
  {
    matches: (push) => !push.isAuthenticated,
    status: {
      label: "Sign in needed",
      description: "Sign in before turning on push notifications.",
      tone: "muted",
    },
  },
  {
    matches: (push) => !push.isOnline,
    status: {
      label: "Offline",
      description: "Reconnect to change push notifications.",
      tone: "attention",
    },
  },
  {
    matches: (push) => push.isPublicKeyLoading,
    status: {
      label: "Checking",
      description: "Checking whether push notifications are available.",
      tone: "muted",
    },
  },
  {
    matches: (push) => !push.isWebPushEnabled,
    status: {
      label: "Not enabled",
      description: "Push notifications are not enabled here yet.",
      tone: "muted",
    },
  },
  {
    matches: (push) => push.permission === "denied",
    status: {
      label: "Blocked",
      description: "Enable notifications in this browser's site settings.",
      tone: "attention",
    },
  },
  {
    matches: (push) => push.isSubscribed,
    status: {
      label: "On",
      description: "Important Findafew alerts.",
      tone: "on",
    },
  },
  {
    matches: (push) => Boolean(push.browserEndpoint),
    status: {
      label: "Ready",
      description: "Turn push on to reconnect this device.",
      tone: "attention",
    },
  },
];

const DEFAULT_WEB_PUSH_STATUS = {
  label: "Off",
  description: "Important Findafew alerts.",
  tone: "muted",
} as const;

const STATUS_PILL_TONE_BY_DEVICE_TONE = {
  attention: "amber",
  muted: "muted",
  on: "teal",
} satisfies Record<WebPushDeviceStatus["tone"], StatusPillTone>;

function getWebPushDeviceStatus(push: WebPushDeviceState) {
  return (
    WEB_PUSH_STATUS_RULES.find((rule) => rule.matches(push))?.status ??
    DEFAULT_WEB_PUSH_STATUS
  );
}

export function getWebPushControlState({
  isOnline,
  push,
}: {
  isOnline: boolean;
  push: WebPushDeviceState;
}): WebPushControlState {
  const status = getWebPushDeviceStatus(push);
  const isBusy = isWebPushControlBusy(push);

  return {
    isBusy,
    isDisabled: isWebPushControlDisabled({ isBusy, isOnline, push }),
    sendTestDisabled: isWebPushSendTestDisabled({ isBusy, isOnline, push }),
    status,
    statusTone: getStatusPillTone(status),
  };
}

function isWebPushControlBusy(push: WebPushDeviceState) {
  return (
    push.isTurningOn || push.isTurningOff || push.isCheckingBrowserSubscription
  );
}

function canToggleWebPush(push: WebPushDeviceState) {
  return push.isOnline && (push.isSubscribed || push.canRequestPermission);
}

function isWebPushSendTestDisabled({
  isBusy,
  isOnline,
  push,
}: {
  isBusy: boolean;
  isOnline: boolean;
  push: WebPushDeviceState;
}) {
  return !isOnline || !push.isOnline || isBusy;
}

function isWebPushControlDisabled({
  isBusy,
  isOnline,
  push,
}: {
  isBusy: boolean;
  isOnline: boolean;
  push: WebPushDeviceState;
}) {
  return hasAnyDisableReason(
    getWebPushDisableReasons({ isBusy, isOnline, push }),
  );
}

function getWebPushDisableReasons({
  isBusy,
  isOnline,
  push,
}: {
  isBusy: boolean;
  isOnline: boolean;
  push: WebPushDeviceState;
}): WebPushDisableReasons {
  return {
    appOffline: !isOnline,
    browserOffline: !push.isOnline,
    busy: isBusy,
    cannotToggle: !canToggleWebPush(push),
    publicKeyLoading: push.isPublicKeyLoading,
  };
}

function hasAnyDisableReason(reasons: WebPushDisableReasons) {
  return Object.values(reasons).some(Boolean);
}

function getStatusPillTone(status: WebPushDeviceStatus): StatusPillTone {
  return STATUS_PILL_TONE_BY_DEVICE_TONE[status.tone];
}
