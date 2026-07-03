import { Bookmark, Pin } from "lucide-react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { formatChatTime } from "@/features/activity/lib/chat-utils";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import type { MessageFooterMetadataState } from "./message-footer-state";
import { MessageStatusIcon } from "./message-status-icon";

export function MessageFooterMetadata({
  createdAt,
  readBy,
  readByCount,
  state,
  status,
}: {
  createdAt: string;
  readBy: NonNullable<UnifiedMessage["readBy"]>;
  readByCount: number;
  state: MessageFooterMetadataState;
  status: UnifiedMessage["status"];
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 whitespace-nowrap opacity-70">
      <PinnedMessageIndicator isVisible={state.isPinned} />
      <SavedMessageIndicator isVisible={state.isSaved} />
      <FailedOwnMessageLabel isVisible={state.isFailedOwnMessage} />
      <EditedMessageLabel isVisible={state.isEdited} />
      <span
        className={cn(
          "select-none font-bold text-nano text-slate-muted tabular-nums",
        )}
      >
        {formatChatTime(createdAt)}
      </span>
      <MessageStatusIcon
        status={status}
        isOwn={state.isOwn}
        isReadByOthers={state.isReadByOthers}
      />
      {state.isOwn && readByCount > 0 ? (
        <ReadBySummary readers={readBy} readByCount={readByCount} />
      ) : null}
    </div>
  );
}

function PinnedMessageIndicator({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <Pin
      aria-label="Pinned message"
      className="size-3 rotate-45 text-primary"
    />
  );
}

function SavedMessageIndicator({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <Bookmark
      aria-label="Saved message"
      className="size-3 fill-primary/20 text-primary"
    />
  );
}

function FailedOwnMessageLabel({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <span className="mr-0.5 font-bold text-destructive text-nano">
      Not sent
    </span>
  );
}

function EditedMessageLabel({ isVisible }: { isVisible: boolean | undefined }) {
  if (!isVisible) {
    return null;
  }

  return (
    <span className="mr-0.5 font-bold text-nano italic opacity-60">Edited</span>
  );
}

function ReadBySummary({
  readers,
  readByCount,
}: {
  readers: NonNullable<UnifiedMessage["readBy"]>;
  readByCount: number;
}) {
  const visibleReaders = readers.slice(0, 3);
  const readerNames = readers.map((reader) => reader.name).join(", ");
  const label =
    readByCount === 1 && readers[0]
      ? `Read by ${readers[0].name}`
      : `Read by ${readByCount}`;

  return (
    <span
      className="ml-0.5 inline-flex min-w-0 items-center gap-1 rounded-full bg-primary/8 px-1.5 py-0.5 text-primary"
      title={readerNames ? `Read by ${readerNames}` : label}
    >
      <span className="max-w-18 truncate font-black text-nano">{label}</span>
      {visibleReaders.length > 0 ? (
        <span className="flex shrink-0 items-center -space-x-1">
          {visibleReaders.map((reader) => (
            <Avatar
              key={reader.id}
              src={reader.avatar}
              name={reader.name}
              className="size-4 border border-canvas bg-primary/10 text-[0.45rem]"
              fallbackClassName="text-[0.45rem]"
              imageSize={32}
            />
          ))}
        </span>
      ) : null}
    </span>
  );
}
