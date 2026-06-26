import { Link } from "@tanstack/react-router";
import { Bell, BellOff, BellRing, ExternalLink } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { IconTile, type IconTileTone } from "@/shared/components/ui/icon-tile";
import { useWebPushSubscription } from "@/shared/hooks/use-web-push-subscription";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";

const DOWNLOAD_AUTH_RETURN_TO = "/download";

type PushState = ReturnType<typeof useWebPushSubscription>;

interface PushCopy {
  body: string;
  title: string;
}

type PushCopyRule = {
  copy: PushCopy;
  shouldUse: (push: PushState) => boolean;
};

interface PushDeniedHelpRule {
  message: string;
  shouldUse: (userAgent: string) => boolean;
}

interface PushReadinessState {
  canTurnOn: boolean;
  iconTone: IconTileTone;
  isActionDisabled: boolean;
  isBusy: boolean;
  isDenied: boolean;
}

type PushNotificationCtaState =
  | { kind: "sign-in" }
  | { isDisabled: boolean; isLoading: boolean; kind: "turn-off" }
  | {
      isDisabled: boolean;
      isLoading: boolean;
      kind: "turn-on";
      label: string;
    };

type PushNotificationCtaRule = {
  getState: (
    push: PushState,
    readiness: PushReadinessState,
  ) => PushNotificationCtaState;
  shouldUse: (push: PushState) => boolean;
};

const PUSH_COPY_RULES: readonly PushCopyRule[] = [
  {
    shouldUse: (push) => !push.support.isSupported,
    copy: {
      title: "Alerts unavailable here",
      body: "This browser can still install TeamForge, but it cannot receive push notifications.",
    },
  },
  {
    shouldUse: (push) => !push.isOnline || push.isPublicKeyNetworkError,
    copy: {
      title: "Reconnect to manage alerts",
      body: "Push settings need the network. Existing device alerts stay as they are until you are back online.",
    },
  },
  {
    shouldUse: (push) => !push.isAuthenticated,
    copy: {
      title: "Unlock mobile alerts",
      body: "Sign in on this device to turn on group invites, messages, and plan updates.",
    },
  },
  {
    shouldUse: (push) => push.isPublicKeyLoading,
    copy: {
      title: "Checking alert capability",
      body: "TeamForge is checking whether this environment can send mobile alerts.",
    },
  },
  {
    shouldUse: (push) => !push.isWebPushEnabled,
    copy: {
      title: "Alerts not enabled yet",
      body: "Installation works now. Push delivery can be turned on when this environment is configured.",
    },
  },
  {
    shouldUse: (push) => push.permission === "denied",
    copy: {
      title: "Alerts are blocked in this browser",
      body: "Notifications are blocked. Re-enable them in your site settings to receive group and plan updates.",
    },
  },
  {
    shouldUse: (push) => push.isSubscribed,
    copy: {
      title: "Alerts are on",
      body: "This device will show TeamForge updates even when the app is closed.",
    },
  },
] as const;

const DEFAULT_PUSH_COPY: PushCopy = {
  title: "Turn on mobile alerts",
  body: "Allow this device to show group invites, messages, and plan reminders.",
};

const DEFAULT_PUSH_DENIED_HELP =
  "Click the lock icon in your address bar -> Notifications -> Allow.";

const PUSH_DENIED_HELP_RULES: readonly PushDeniedHelpRule[] = [
  {
    shouldUse: (userAgent) =>
      /safari/i.test(userAgent) && !/chrome|chromium/i.test(userAgent),
    message:
      "Go to Safari -> Settings for this Website -> Notifications -> Allow.",
  },
  {
    shouldUse: (userAgent) => /firefox/i.test(userAgent),
    message:
      "Click the shield icon in your address bar and disable notification blocking.",
  },
  {
    shouldUse: (userAgent) => /edg\//i.test(userAgent),
    message:
      "Click the lock icon in your address bar -> Permissions -> Notifications -> Allow.",
  },
] as const;

const PUSH_NOTIFICATION_CTA_RULES: readonly PushNotificationCtaRule[] = [
  {
    shouldUse: (push) => !push.isAuthenticated,
    getState: () => ({ kind: "sign-in" }),
  },
  {
    shouldUse: (push) => push.isSubscribed,
    getState: (push, readiness) => ({
      kind: "turn-off",
      isDisabled: !push.isOnline || readiness.isBusy,
      isLoading: push.isTurningOff,
    }),
  },
] as const;

function getPushDeniedHelp(): string {
  if (typeof navigator === "undefined") {
    return "Open your browser's site settings and allow notifications for TeamForge.";
  }

  return getBrowserPushDeniedHelp(navigator.userAgent);
}

function getBrowserPushDeniedHelp(userAgent: string) {
  return (
    PUSH_DENIED_HELP_RULES.find((rule) => rule.shouldUse(userAgent))?.message ??
    DEFAULT_PUSH_DENIED_HELP
  );
}

function getPushCopy(push: PushState) {
  return (
    PUSH_COPY_RULES.find((rule) => rule.shouldUse(push))?.copy ??
    DEFAULT_PUSH_COPY
  );
}

function getPushReadiness(push: PushState): PushReadinessState {
  const isDenied = push.permission === "denied";
  const isBusy = isPushBusy(push);

  return {
    canTurnOn: canTurnOnPush(push),
    iconTone: getPushIconTone(push, isDenied),
    isActionDisabled: isPushActionDisabled(push, isBusy),
    isBusy,
    isDenied,
  };
}

function isPushBusy(push: PushState) {
  return (
    push.isTurningOn || push.isTurningOff || push.isCheckingBrowserSubscription
  );
}

function canTurnOnPush(push: PushState) {
  return (
    push.canRequestPermission && !push.isSubscribed && !push.isPublicKeyLoading
  );
}

function isPushActionDisabled(push: PushState, isBusy: boolean) {
  return [
    !push.isOnline,
    isBusy,
    push.isPublicKeyLoading,
    !push.isSubscribed && !push.canRequestPermission,
  ].some(Boolean);
}

function getPushIconTone(push: PushState, isDenied: boolean): IconTileTone {
  if (push.isSubscribed) {
    return "teal";
  }

  return isDenied ? "amber" : "muted";
}

function getPushNotificationCtaState(
  push: PushState,
  readiness: PushReadinessState,
): PushNotificationCtaState {
  return (
    PUSH_NOTIFICATION_CTA_RULES.find((rule) => rule.shouldUse(push))?.getState(
      push,
      readiness,
    ) ?? getTurnOnPushCtaState(push, readiness)
  );
}

function getTurnOnPushCtaState(
  push: PushState,
  readiness: PushReadinessState,
): PushNotificationCtaState {
  return {
    kind: "turn-on",
    isDisabled: !readiness.canTurnOn || readiness.isActionDisabled,
    isLoading: push.isTurningOn,
    label: readiness.isDenied ? "Blocked in browser" : "Turn on alerts",
  };
}

export function PushNotificationBand() {
  const push = useWebPushSubscription();
  const copy = getPushCopy(push);
  const readiness = getPushReadiness(push);
  const Icon = push.isSubscribed ? BellRing : Bell;

  return (
    <div className="border-primary/12 border-y bg-primary/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="flex items-start gap-4">
          <IconTile
            icon={Icon}
            shape="circle"
            size="lg"
            tone={readiness.iconTone}
            className={push.isSubscribed ? "size-11 bg-primary/12" : "size-11"}
            iconClassName="size-5"
          />
          <div className="min-w-0">
            <p className="font-bold text-ink">{copy.title}</p>
            <p className="mt-0.5 max-w-lg text-pretty text-slate-muted text-sm leading-relaxed">
              {copy.body}
            </p>
            <PushDeniedHelp isDenied={readiness.isDenied} />
          </div>
        </div>

        <div className="shrink-0">
          <PushNotificationCta push={push} readiness={readiness} />
        </div>
      </div>
    </div>
  );
}

function PushDeniedHelp({ isDenied }: { isDenied: boolean }) {
  if (!isDenied) {
    return null;
  }

  return (
    <p className="mt-2 flex items-start gap-1.5 text-slate-muted text-sm">
      <ExternalLink
        size={13}
        className="mt-0.5 shrink-0 text-spark-amber"
        aria-hidden="true"
      />
      <span>{getPushDeniedHelp()}</span>
    </p>
  );
}

function PushNotificationCta({
  push,
  readiness,
}: {
  push: PushState;
  readiness: PushReadinessState;
}) {
  const cta = getPushNotificationCtaState(push, readiness);

  if (cta.kind === "sign-in") {
    return (
      <Button
        variant="outline"
        size="sm"
        asChild
        className="min-h-11 lg:min-h-9"
      >
        <Link
          {...buildAuthRouteNavigation("/auth/login", DOWNLOAD_AUTH_RETURN_TO)}
        >
          Sign in to enable alerts
        </Link>
      </Button>
    );
  }

  if (cta.kind === "turn-off") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="min-h-11 lg:min-h-9"
        disabled={cta.isDisabled}
        loading={cta.isLoading}
        onClick={() => {
          void push.turnOff("download");
        }}
      >
        <BellOff size={15} strokeWidth={2} aria-hidden="true" />
        Turn off alerts
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      className="min-h-11 text-white lg:min-h-9"
      disabled={cta.isDisabled}
      loading={cta.isLoading}
      onClick={() => {
        void push.turnOn("download");
      }}
    >
      <BellRing size={15} strokeWidth={2} aria-hidden="true" />
      {cta.label}
    </Button>
  );
}
