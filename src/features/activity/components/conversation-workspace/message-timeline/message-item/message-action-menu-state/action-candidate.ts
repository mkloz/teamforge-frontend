import type { MessageActionCandidate, MessageActionItem } from "./types";

export function isMessageActionItem(
  action: MessageActionCandidate,
): action is MessageActionItem {
  return action !== null;
}
