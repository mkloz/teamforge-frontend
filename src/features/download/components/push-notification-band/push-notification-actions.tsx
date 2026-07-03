import { Link } from "@tanstack/react-router";
import { BellOff, BellRing } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";

import type {
  PushNotificationCtaState,
  PushReadinessState,
  PushState,
} from "./types";

const DOWNLOAD_AUTH_RETURN_TO = "/download";

type PushNotificationCtaRule = {
  getState: (
    push: PushState,
    readiness: PushReadinessState,
  ) => PushNotificationCtaState;
  shouldUse: (push: PushState) => boolean;
};

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

export function PushNotificationActions({
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
