import { memo } from "react";

export const NewMessagesSeparator = memo(function NewMessagesSeparator() {
  return (
    <div className="pointer-events-none my-3 flex w-full items-center gap-2">
      <span aria-hidden="true" className="h-px flex-1 bg-accent/45" />
      <span className="shrink-0 rounded-full border border-accent/35 bg-accent/12 px-3 py-1 font-black text-accent text-micro shadow-accent/10 shadow-sm backdrop-blur-md">
        New messages
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-accent/45" />
    </div>
  );
});
