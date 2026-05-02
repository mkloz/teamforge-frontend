import { ActivityApi } from "@/features/activity/api/activity.api";
import type {
  ActivityActionContext,
  SendActivityMessageInput,
} from "@/features/activity/api/activity-action-context";
import { buildSendMessagePayload } from "@/features/activity/api/activity-outgoing-message";
import type { OutgoingMessageTarget } from "@/features/activity/api/message-actions/send-message-target";

export async function sendMessageToApi(
  context: ActivityActionContext,
  target: OutgoingMessageTarget,
  input: SendActivityMessageInput,
) {
  const payload = await buildSendMessagePayload(input);
  const sentMessageResult = await ActivityApi.sendMessage(
    target.chatId,
    payload,
  );
  const mappedMessage = context.mapMessages(
    [sentMessageResult.data],
    target.participants,
    target.currentUser.id,
  )[0];

  return {
    message: mappedMessage,
    requestId: sentMessageResult.requestId,
  };
}
