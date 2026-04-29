import { memo } from "react";
import type { UnifiedMessage } from "../../../lib/activity-contract";
import { formatChatTime } from "../../../lib/chat-utils";
import { MessageStatusIcon } from "../message-status-icon";

interface MediaTimeOverlayProps {
  timestamp: string;
  isOwn: boolean;
  status?: UnifiedMessage["status"];
  isReadByOthers: boolean;
}

export const MediaTimeOverlay = memo(
  ({ timestamp, isOwn, status, isReadByOthers }: MediaTimeOverlayProps) => (
    <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-lg z-20">
      <span className="text-nano font-black tabular-nums tracking-tighter opacity-90">
        {formatChatTime(timestamp)}
      </span>
      {isOwn && status && (
        <div className="opacity-80">
          <MessageStatusIcon
            status={status}
            isOwn={isOwn}
            isReadByOthers={isReadByOthers}
          />
        </div>
      )}
    </div>
  ),
);
