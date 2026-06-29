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

function hasMessageBlockBoundary(
  nextBlock: Pick<
    MessageBlockInput,
    "newMessagesSeparatorBeforeId" | "showDateSeparator"
  >,
) {
  return Boolean(
    nextBlock.showDateSeparator || nextBlock.newMessagesSeparatorBeforeId,
  );
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

  if (hasMessageBlockBoundary(nextBlock)) {
    return nextBlock.showDateSeparator ? "compact" : "normal";
  }

  const isCurrentSystemBlock = isSystemBlock(block);
  const isNextSystemBlock = isSystemBlock(nextBlock);

  return getParticipantBlockSpacing({
    block,
    isCurrentSystemBlock,
    isNextSystemBlock,
    nextBlock,
  });
}

function getParticipantBlockSpacing({
  block,
  isCurrentSystemBlock,
  isNextSystemBlock,
  nextBlock,
}: {
  block: Pick<MessageBlockInput, "senderGroup">;
  isCurrentSystemBlock: boolean;
  isNextSystemBlock: boolean;
  nextBlock: Pick<MessageBlockInput, "senderGroup">;
}): MessageBlockSpacing {
  const systemSpacing = getSystemBlockSpacing(
    isCurrentSystemBlock,
    isNextSystemBlock,
  );

  if (systemSpacing) {
    return systemSpacing;
  }

  return getParticipantSenderSpacing(block, nextBlock);
}

function getSystemBlockSpacing(
  isCurrentSystemBlock: boolean,
  isNextSystemBlock: boolean,
): MessageBlockSpacing | null {
  if (isCurrentSystemBlock && isNextSystemBlock) {
    return "compact";
  }

  if (isCurrentSystemBlock || isNextSystemBlock) {
    return "system-boundary";
  }

  return null;
}

function getParticipantSenderSpacing(
  block: Pick<MessageBlockInput, "senderGroup">,
  nextBlock: Pick<MessageBlockInput, "senderGroup">,
) {
  return isSameSenderBlock(block, nextBlock) ? "related" : "normal";
}

function isSameSenderBlock(
  block: Pick<MessageBlockInput, "senderGroup">,
  nextBlock: Pick<MessageBlockInput, "senderGroup">,
) {
  return block.senderGroup.senderId === nextBlock.senderGroup.senderId;
}

function buildBaseMessageBlock(
  dateGroup: DateGroup,
  senderGroup: DateGroup["senderGroups"][number],
  groupIdx: number,
  firstUnreadMessageId: string | null,
): Omit<MessageBlockInput, "spacingAfter"> {
  return {
    date: dateGroup.date,
    isOwn:
      senderGroup.items[0]?.isOwn ?? isCurrentUserSender(senderGroup.senderId),
    key: `sender-group-${dateGroup.date}-${senderGroup.senderId}-${groupIdx}`,
    newMessagesSeparatorBeforeId: getNewMessagesSeparatorBeforeId(
      senderGroup,
      firstUnreadMessageId,
    ),
    senderGroup,
    showDateSeparator: groupIdx === 0,
  };
}

function getNewMessagesSeparatorBeforeId(
  senderGroup: DateGroup["senderGroups"][number],
  firstUnreadMessageId: string | null,
) {
  return senderGroup.items.some(
    (message) => message.id === firstUnreadMessageId,
  )
    ? firstUnreadMessageId
    : null;
}

export function buildMessageBlocks(
  groupedMessages: DateGroup[],
  firstUnreadMessageId: string | null = null,
): MessageBlockInput[] {
  const blocks = groupedMessages.flatMap((dateGroup) =>
    dateGroup.senderGroups.map<Omit<MessageBlockInput, "spacingAfter">>(
      (senderGroup, groupIdx) =>
        buildBaseMessageBlock(
          dateGroup,
          senderGroup,
          groupIdx,
          firstUnreadMessageId,
        ),
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
