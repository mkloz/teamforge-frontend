import { Bell, BellRing } from "lucide-react";

import { getPushCopy } from "./push-copy";
import { getPushReadiness } from "./push-readiness";
import type { PushNotificationBandViewModel, PushState } from "./types";

export function getPushNotificationBandViewModel(
  push: PushState,
): PushNotificationBandViewModel {
  return {
    copy: getPushCopy(push),
    Icon: push.isSubscribed ? BellRing : Bell,
    iconClassName: push.isSubscribed ? "size-11 bg-primary/12" : "size-11",
    readiness: getPushReadiness(push),
  };
}
