import { formatDateSeparator } from "@/features/activity/lib/chat-utils";
import { memo } from "react";

export const DateSeparator = memo(({ date }: { date: string }) => (
  <div className="pointer-events-none sticky -top-3 z-20 mt-4 mb-2 flex items-center justify-center">
    <span className="rounded-full border border-border/10 bg-canvas/80 px-3 py-1 text-micro font-bold text-slate-muted shadow-sm backdrop-blur-md">
      {formatDateSeparator(date)}
    </span>
  </div>
));
