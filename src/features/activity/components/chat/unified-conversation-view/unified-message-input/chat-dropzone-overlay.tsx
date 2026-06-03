import { Upload } from "lucide-react";
import { memo } from "react";

export const ChatDropzoneOverlay = memo(function ChatDropzoneOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-3 z-50 flex items-center justify-center rounded-2xl border-2 border-forge-teal/70 border-dashed bg-canvas/92 p-4 text-center shadow-2xl backdrop-blur-md sm:inset-5"
      role="presentation"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-3">
        <span className="flex size-14 items-center justify-center rounded-full border border-forge-teal/20 bg-forge-teal/10 text-forge-teal shadow-sm">
          <Upload className="size-6" aria-hidden="true" strokeWidth={2} />
        </span>
        <div className="grid gap-1">
          <p className="font-black text-ink text-lg leading-tight">
            Drop files to attach
          </p>
          <p className="text-slate-muted text-sm leading-relaxed">
            They'll be added to your message before you send.
          </p>
        </div>
      </div>
    </div>
  );
});
