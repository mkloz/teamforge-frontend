import { memo } from "react";

export const UnreadIndicator = memo(() => (
  <div className="flex items-center gap-4 my-6 animate-in fade-in duration-1000">
    <div className="h-px flex-1 bg-linear-to-r from-transparent via-spark-amber/30 to-spark-amber/50" />
    <span className="text-micro font-bold text-spark-amber tracking-wider px-3 py-1 rounded-full bg-spark-amber/5 border border-spark-amber/20">
      New messages
    </span>
    <div className="h-px flex-1 bg-linear-to-l from-transparent via-spark-amber/30 to-spark-amber/50" />
  </div>
));
