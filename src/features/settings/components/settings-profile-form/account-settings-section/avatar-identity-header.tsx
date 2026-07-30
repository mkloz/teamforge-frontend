import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/shared/components/common/avatar";
import type { User } from "@/shared/schemas";

interface AvatarIdentityHeaderProps {
  action?: ReactNode;
  currentUser: User | undefined;
  displayedAvatarUrl: string | null | undefined;
}

const AVATAR_IDENTITY_FALLBACK = {
  bio: "Add a short intro so people have an easier first step when your group opens.",
  name: "Your account",
} as const;

export function AvatarIdentityHeader({
  action,
  currentUser,
  displayedAvatarUrl,
}: AvatarIdentityHeaderProps) {
  const content = getAvatarIdentityContent(currentUser);

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <Avatar
          src={displayedAvatarUrl}
          name={currentUser?.name}
          imageSize={112}
          className="size-20 bg-input text-xl sm:size-22"
          loading="eager"
        />
        {action ? (
          <div className="absolute -top-1 -right-1 z-10">{action}</div>
        ) : null}
        <span className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-3 border-card bg-primary text-primary-foreground">
          <CheckCircle2 size={14} strokeWidth={2.25} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-muted text-xs">Profile preview</p>
        <h2 className="mt-1 font-semibold text-ink text-xl leading-tight">
          {content.name}
        </h2>
        <p className="wrap-break-word mt-1.5 line-clamp-2 text-slate-muted text-sm leading-relaxed">
          {content.bio}
        </p>
      </div>
    </div>
  );
}

function getAvatarIdentityContent(currentUser: User | undefined) {
  return {
    bio: currentUser?.bio || AVATAR_IDENTITY_FALLBACK.bio,
    name: currentUser?.name ?? AVATAR_IDENTITY_FALLBACK.name,
  };
}
