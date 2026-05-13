import { Avatar, AvatarStatus } from "@/shared/components/common/avatar";
import type { OnlineStatus } from "@/shared/schemas/enums";

interface ProfileAvatarProps {
  src: string | null;
  name: string;
  onlineStatus: OnlineStatus;
}

export function ProfileAvatar({ src, name, onlineStatus }: ProfileAvatarProps) {
  return (
    <div className="group relative shrink-0">
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
    </div>
  );
}
