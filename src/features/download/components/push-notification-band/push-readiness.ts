import type { IconTileTone } from "@/shared/components/ui/icon-tile";

import type { PushReadinessState, PushState } from "./types";

export function getPushReadiness(push: PushState): PushReadinessState {
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
