import { memo } from "react";

export const NewMessagesSeparator = memo(function NewMessagesSeparator() {
  return (
    <div className="pointer-events-none my-2 flex items-center gap-3">
      <span aria-hidden="true" className="h-px flex-1 bg-forge-teal/25" />
      <span className="rounded-full border border-forge-teal/20 bg-forge-teal/8 px-3 py-1 font-bold text-forge-teal text-micro shadow-sm backdrop-blur-md">
        New messages
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-forge-teal/25" />
    </div>
  );
});
