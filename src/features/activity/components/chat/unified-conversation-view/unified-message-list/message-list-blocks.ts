import type { DateGroup } from "@/features/activity/hooks/use-message-grouping";
import type { MessageBlockInput } from "@/features/activity/hooks/use-virtualized-message-blocks";

function isCurrentUserSender(senderId: string) {
  return senderId === "current-user" || senderId === "user-current";
}

export function buildMessageBlocks(
  groupedMessages: DateGroup[],
): MessageBlockInput[] {
  return groupedMessages.flatMap((dateGroup) =>
    dateGroup.senderGroups.map((senderGroup, groupIdx) => ({
      date: dateGroup.date,
      isOwn:
        senderGroup.items[0]?.isOwn ??
        isCurrentUserSender(senderGroup.senderId),
      key: `sender-group-${dateGroup.date}-${senderGroup.senderId}-${groupIdx}`,
      senderGroup,
      showDateSeparator: groupIdx === 0,
    })),
  );
}
