import {
  forgetRetryableMessage,
  releaseOptimisticMessageResources,
} from "@/features/activity/api/activity-outgoing-message";
import { ActivityMessageMutationActions } from "@/features/activity/api/message-actions/message-mutation-actions";
import { ActivityPinnedMessageActions } from "@/features/activity/api/message-actions/pinned-message-actions";
import { ActivitySendMessageActions } from "@/features/activity/api/message-actions/send-message-actions";

export const ActivityMessageActions = {
  releaseOptimisticMessageResources,

  forgetRetryableMessage,

  ...ActivitySendMessageActions,

  ...ActivityMessageMutationActions,

  ...ActivityPinnedMessageActions,
};
