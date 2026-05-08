import { memo } from "react";
import { formatDateSeparator } from "@/features/activity/lib/chat-utils";

export const DateSeparator = memo(({ date }: { date: string }) => (
  <div className="pointer-events-none sticky -top-3 z-20 mt-4 mb-2 flex items-center justify-center">
    <span className="rounded-full border border-border/10 bg-canvas/80 px-3 py-1 font-bold text-micro text-slate-muted shadow-sm backdrop-blur-md">
      {formatDateSeparator(date)}
    </span>
  </div>
));
