import { memo } from "react";

export const NewMessagesSeparator = memo(function NewMessagesSeparator() {
  return (
    <div className="pointer-events-none my-3 flex w-full items-center gap-2">
      <span aria-hidden="true" className="h-px flex-1 bg-spark-amber/45" />
      <span className="shrink-0 rounded-full border border-spark-amber/35 bg-spark-amber/12 px-3 py-1 font-black text-micro text-spark-amber shadow-sm shadow-spark-amber/10 backdrop-blur-md">
        New messages
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-spark-amber/45" />
    </div>
  );
});
