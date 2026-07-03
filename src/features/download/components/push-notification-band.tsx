import { useWebPushSubscription } from "@/shared/hooks/use-web-push-subscription";

import { PushNotificationActions } from "./push-notification-band/push-notification-actions";
import { PushNotificationStatus } from "./push-notification-band/push-notification-status";
import { getPushNotificationBandViewModel } from "./push-notification-band/push-notification-view-model";

export function PushNotificationBand() {
  const push = useWebPushSubscription();
  const viewModel = getPushNotificationBandViewModel(push);

  return (
    <div className="border-primary/12 border-y bg-primary/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <PushNotificationStatus
          copy={viewModel.copy}
          icon={viewModel.Icon}
          iconClassName={viewModel.iconClassName}
          iconTone={viewModel.readiness.iconTone}
          isDenied={viewModel.readiness.isDenied}
        />

        <div className="shrink-0">
          <PushNotificationActions
            push={push}
            readiness={viewModel.readiness}
          />
        </div>
      </div>
    </div>
  );
}
