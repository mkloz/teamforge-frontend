import type { DateGroup } from "@/features/activity/hooks/use-message-grouping";
import type {
  MessageBlockInput,
  MessageBlockSpacing,
} from "@/features/activity/hooks/use-virtualized-message-blocks";

function isCurrentUserSender(senderId: string) {
  return senderId === "current-user" || senderId === "user-current";
}

function isSystemBlock(block: Pick<MessageBlockInput, "senderGroup">) {
  return block.senderGroup.items.every((message) => message.type === "SYSTEM");
}

function getSpacingAfter(
  block: Pick<MessageBlockInput, "senderGroup">,
  nextBlock: Pick<
    MessageBlockInput,
    "newMessagesSeparatorBeforeId" | "senderGroup" | "showDateSeparator"
  > | null,
): MessageBlockSpacing {
  if (!nextBlock) {
    return "compact";
  }

  if (nextBlock.showDateSeparator) {
    return "compact";
  }

  if (nextBlock.newMessagesSeparatorBeforeId) {
    return "normal";
  }

  const isCurrentSystemBlock = isSystemBlock(block);
  const isNextSystemBlock = isSystemBlock(nextBlock);

  if (isCurrentSystemBlock && isNextSystemBlock) {
    return "compact";
  }

  if (isCurrentSystemBlock || isNextSystemBlock) {
    return "system-boundary";
  }

  return block.senderGroup.senderId === nextBlock.senderGroup.senderId
    ? "related"
    : "normal";
}

export function buildMessageBlocks(
  groupedMessages: DateGroup[],
  firstUnreadMessageId: string | null = null,
): MessageBlockInput[] {
  const blocks = groupedMessages.flatMap((dateGroup) =>
    dateGroup.senderGroups.map<Omit<MessageBlockInput, "spacingAfter">>(
      (senderGroup, groupIdx) => ({
        date: dateGroup.date,
        isOwn:
          senderGroup.items[0]?.isOwn ??
          isCurrentUserSender(senderGroup.senderId),
        key: `sender-group-${dateGroup.date}-${senderGroup.senderId}-${groupIdx}`,
        newMessagesSeparatorBeforeId: senderGroup.items.some(
          (message) => message.id === firstUnreadMessageId,
        )
          ? firstUnreadMessageId
          : null,
        senderGroup,
        showDateSeparator: groupIdx === 0,
      }),
    ),
  );

  return blocks.map((block, index) => ({
    date: block.date,
    isOwn: block.isOwn,
    key: block.key,
    newMessagesSeparatorBeforeId: block.newMessagesSeparatorBeforeId,
    senderGroup: block.senderGroup,
    showDateSeparator: block.showDateSeparator,
    spacingAfter: getSpacingAfter(block, blocks[index + 1] ?? null),
  }));
}
