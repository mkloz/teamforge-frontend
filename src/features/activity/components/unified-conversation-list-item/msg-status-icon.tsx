import { Check, CheckCheck } from "lucide-react";
import { memo } from "react";
import type { MessageStatus } from "../../types/direct-chats.types";

export const MsgStatusIcon = memo(({ status }: { status: MessageStatus }) => {
  switch (status) {
    case "SENDING":
      return (
        <span className="w-3 h-3 rounded-full border border-slate-muted/40 border-t-transparent animate-spin" />
      );
    case "SENT":
      return <Check size={12} className="text-slate-muted" />;
    case "DELIVERED":
      return <CheckCheck size={12} className="text-slate-muted" />;
    case "READ":
      return <CheckCheck size={12} className="text-forge-teal" />;
    default:
      return null;
  }
});
