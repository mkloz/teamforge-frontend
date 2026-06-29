import { Upload } from "lucide-react";
import { IconTile } from "@/shared/components/ui/icon-tile";

export function ChatDropzoneOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-3 z-50 flex items-center justify-center rounded-2xl border-2 border-primary/70 border-dashed bg-canvas/92 p-4 text-center shadow-2xl backdrop-blur-md sm:inset-5"
      role="presentation"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-3">
        <IconTile
          icon={Upload}
          size="2xl"
          shape="circle"
          tone="teal"
          bordered
          className="border-primary/20 shadow-sm"
        />
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
}
