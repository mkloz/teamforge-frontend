import { formatDateSeparator } from "@/features/activity/lib/chat-utils";
import { memo } from "react";

export const DateSeparator = memo(({ date }: { date: string }) => (
  <div className="sticky -top-3 z-20 flex items-center justify-center pointer-events-none mt-4 mb-2">
    <span className="px-3 py-1 rounded-full bg-canvas/80 text-micro text-slate-muted font-bold border border-border/10 backdrop-blur-md shadow-sm">
      {formatDateSeparator(date)}
    </span>
  </div>
));
