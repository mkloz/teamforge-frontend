import { Link } from "@tanstack/react-router";
import { Bell, BellOff, BellRing, ExternalLink } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { IconTile, type IconTileTone } from "@/shared/components/ui/icon-tile";
import { useWebPushSubscription } from "@/shared/hooks/use-web-push-subscription";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";

const DOWNLOAD_AUTH_RETURN_TO = "/download";

type PushState = ReturnType<typeof useWebPushSubscription>;

interface PushReadinessState {
  canTurnOn: boolean;
  iconTone: IconTileTone;
  isActionDisabled: boolean;
  isBusy: boolean;
  isDenied: boolean;
}

function getPushDeniedHelp(): string {
  if (typeof navigator === "undefined") {
    return "Open your browser's site settings and allow notifications for TeamForge.";
  }

  const ua = navigator.userAgent;

  if (/safari/i.test(ua) && !/chrome|chromium/i.test(ua)) {
    return "Go to Safari -> Settings for this Website -> Notifications -> Allow.";
  }

  if (/firefox/i.test(ua)) {
    return "Click the shield icon in your address bar and disable notification blocking.";
  }

  if (/edg\//i.test(ua)) {
    return "Click the lock icon in your address bar -> Permissions -> Notifications -> Allow.";
  }

  return "Click the lock icon in your address bar -> Notifications -> Allow.";
}

function getPushCopy(push: PushState) {
  if (!push.support.isSupported) {
    return {
      title: "Alerts unavailable here",
      body: "This browser can still install TeamForge, but it cannot receive push notifications.",
    };
  }

  if (!push.isOnline || push.isPublicKeyNetworkError) {
    return {
      title: "Reconnect to manage alerts",
      body: "Push settings need the network. Existing device alerts stay as they are until you are back online.",
    };
  }

  if (!push.isAuthenticated) {
    return {
      title: "Unlock mobile alerts",
      body: "Sign in on this device to turn on group invites, messages, and plan updates.",
    };
  }

  if (push.isPublicKeyLoading) {
    return {
      title: "Checking alert capability",
      body: "TeamForge is checking whether this environment can send mobile alerts.",
    };
  }

  if (!push.isWebPushEnabled) {
    return {
      title: "Alerts not enabled yet",
      body: "Installation works now. Push delivery can be turned on when this environment is configured.",
    };
  }

  if (push.permission === "denied") {
    return {
      title: "Alerts are blocked in this browser",
      body: "Notifications are blocked. Re-enable them in your site settings to receive group and plan updates.",
    };
  }

  if (push.isSubscribed) {
    return {
      title: "Alerts are on",
      body: "This device will show TeamForge updates even when the app is closed.",
    };
  }

  return {
    title: "Turn on mobile alerts",
    body: "Allow this device to show group invites, messages, and plan reminders.",
  };
}

function getPushReadiness(push: PushState): PushReadinessState {
  const isBusy =
    push.isTurningOn || push.isTurningOff || push.isCheckingBrowserSubscription;
  const canTurnOn =
    push.canRequestPermission && !push.isSubscribed && !push.isPublicKeyLoading;
  const isActionDisabled =
    !push.isOnline ||
    isBusy ||
    push.isPublicKeyLoading ||
    (!push.isSubscribed && !push.canRequestPermission);
  const isDenied = push.permission === "denied";
  const iconTone: IconTileTone = push.isSubscribed
    ? "teal"
    : isDenied
      ? "amber"
      : "muted";

  return {
    canTurnOn,
    iconTone,
    isActionDisabled,
    isBusy,
    isDenied,
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
  if (!push.isAuthenticated) {
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

  if (push.isSubscribed) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="min-h-11 lg:min-h-9"
        disabled={!push.isOnline || readiness.isBusy}
        loading={push.isTurningOff}
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
      disabled={!readiness.canTurnOn || readiness.isActionDisabled}
      loading={push.isTurningOn}
      onClick={() => {
        void push.turnOn("download");
      }}
    >
      <BellRing size={15} strokeWidth={2} aria-hidden="true" />
      {readiness.isDenied ? "Blocked in browser" : "Turn on alerts"}
    </Button>
  );
}
