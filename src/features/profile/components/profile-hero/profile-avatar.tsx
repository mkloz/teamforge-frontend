import { Avatar, AvatarStatus } from "@/shared/components/common/avatar";
import { AvatarPreviewDialog } from "@/shared/components/common/avatar-preview-dialog";
import type { OnlineStatus } from "@/shared/schemas/enums";

interface ProfileAvatarProps {
  src: string | null;
  name: string;
  onlineStatus: OnlineStatus;
}

export function ProfileAvatar({ src, name, onlineStatus }: ProfileAvatarProps) {
  return (
    <AvatarPreviewDialog name={name} src={src}>
      <button
        type="button"
        className="group relative shrink-0 cursor-zoom-in appearance-none rounded-full border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        aria-label={`Expand ${name} avatar`}
      >
        <div className="absolute inset-0 rounded-full bg-spark-amber/20 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute -inset-1.5 rounded-full border-2 border-forge-teal/30 opacity-0 transition duration-700 group-hover:rotate-180 group-hover:scale-105 group-hover:opacity-100" />
        <div className="relative z-10 size-26 transition-transform duration-300 group-hover:scale-105 sm:size-34">
          <Avatar
            src={src}
            name={name}
            className="size-full border-canvas border-thick bg-muted text-2xl shadow-lg ring-1 ring-border/70 sm:text-4xl"
            fallbackClassName="bg-muted text-forge-teal text-2xl sm:text-4xl"
            loading="eager"
          />
          <AvatarStatus
            status={onlineStatus}
            borderClassName="border-canvas"
            sizeClassName="size-4 sm:size-5"
          />
        </div>
      </button>
    </AvatarPreviewDialog>
  );
}
