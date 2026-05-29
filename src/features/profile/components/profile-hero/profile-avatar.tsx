import { lazy, Suspense, useState } from "react";
import { Avatar, AvatarStatus } from "@/shared/components/common/avatar";
import type { OnlineStatus } from "@/shared/schemas/enums";

const LazyAvatarPreviewDialog = lazy(() =>
  import("@/shared/components/common/avatar-preview-dialog").then((module) => ({
    default: module.AvatarPreviewDialog,
  })),
);

interface ProfileAvatarProps {
  src: string | null;
  name: string;
  onlineStatus: OnlineStatus;
}

export function ProfileAvatar({ src, name, onlineStatus }: ProfileAvatarProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const trigger = (
    <ProfileAvatarButton
      src={src}
      name={name}
      onlineStatus={onlineStatus}
      onOpen={() => setPreviewOpen(true)}
    />
  );

  if (!previewOpen) {
    return trigger;
  }

  return (
    <Suspense fallback={trigger}>
      <LazyAvatarPreviewDialog
        name={name}
        onOpenChange={setPreviewOpen}
        open={previewOpen}
        src={src}
      >
        {trigger}
      </LazyAvatarPreviewDialog>
    </Suspense>
  );
}

function ProfileAvatarButton({
  name,
  onOpen,
  onlineStatus,
  src,
}: ProfileAvatarProps & { onOpen: () => void }) {
  return (
    <button
      type="button"
      className="group relative shrink-0 cursor-zoom-in appearance-none rounded-full border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      aria-label={`Expand ${name} avatar`}
      onClick={onOpen}
    >
      <div className="absolute inset-0 rounded-full bg-spark-amber/20 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100" />
      <div className="absolute -inset-1.5 rounded-full border-2 border-forge-teal/30 opacity-0 transition duration-700 group-hover:rotate-180 group-hover:scale-105 group-hover:opacity-100" />
      <div className="relative z-10 size-26 transition-transform duration-300 group-hover:scale-105 sm:size-34">
        <Avatar
          src={src}
          name={name}
          className="size-full border-canvas border-thick bg-muted text-2xl shadow-lg ring-1 ring-border/70 sm:text-4xl"
          fallbackClassName="bg-muted text-forge-teal text-2xl sm:text-4xl"
          imageSize={128}
          loading="eager"
        />
        <AvatarStatus
          status={onlineStatus}
          borderClassName="border-canvas"
          sizeClassName="size-4 sm:size-5"
        />
      </div>
    </button>
  );
}
