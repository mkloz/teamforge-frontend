import { memo } from "react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { formatChatTime } from "@/features/activity/lib/chat-utils";
import { MessageStatusIcon } from "../message-status-icon";

interface MediaTimeOverlayProps {
  timestamp: string;
  isOwn: boolean;
  status?: UnifiedMessage["status"];
  isReadByOthers: boolean;
}

export const MediaTimeOverlay = memo(
  ({ timestamp, isOwn, status, isReadByOthers }: MediaTimeOverlayProps) => (
    <div className="absolute right-2 bottom-2 z-20 flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-1.5 py-0.5 text-white shadow-lg backdrop-blur-md">
      <span className="text-nano font-black tracking-tighter tabular-nums opacity-90">
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
