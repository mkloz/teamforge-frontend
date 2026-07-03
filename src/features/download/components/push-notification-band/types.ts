import type { LucideIcon } from "lucide-react";

import type { IconTileTone } from "@/shared/components/ui/icon-tile";
import type { useWebPushSubscription } from "@/shared/hooks/use-web-push-subscription";

export type PushState = ReturnType<typeof useWebPushSubscription>;

export interface PushCopy {
  body: string;
  title: string;
}

export interface PushReadinessState {
  canTurnOn: boolean;
  iconTone: IconTileTone;
  isActionDisabled: boolean;
  isBusy: boolean;
  isDenied: boolean;
}

export interface PushNotificationBandViewModel {
  copy: PushCopy;
  Icon: LucideIcon;
  iconClassName: string;
  readiness: PushReadinessState;
}

export type PushNotificationCtaState =
  | { kind: "sign-in" }
  | { isDisabled: boolean; isLoading: boolean; kind: "turn-off" }
  | {
      isDisabled: boolean;
      isLoading: boolean;
      kind: "turn-on";
      label: string;
    };
