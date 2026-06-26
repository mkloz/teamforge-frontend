import { CheckCircle2 } from "lucide-react";
import { Avatar } from "@/shared/components/common/avatar";
import type { User } from "@/shared/schemas";

interface AvatarIdentityHeaderProps {
  currentUser: User | undefined;
  displayedAvatarUrl: string | null | undefined;
}

const AVATAR_IDENTITY_FALLBACK = {
  bio: "Add a short intro so people have an easier first step when your group opens.",
  name: "Your account",
} as const;

export function AvatarIdentityHeader({
  currentUser,
  displayedAvatarUrl,
}: AvatarIdentityHeaderProps) {
  const content = getAvatarIdentityContent(currentUser);

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="hidden w-fit flex-col gap-2 sm:flex">
        <div className="relative">
          <Avatar
            src={displayedAvatarUrl}
            name={currentUser?.name}
            imageSize={128}
            className="size-28 border border-border bg-card text-2xl shadow-sm"
            loading="eager"
          />
          <span className="absolute -right-1 -bottom-1 flex size-9 items-center justify-center rounded-full border-4 border-canvas bg-primary text-primary-foreground">
            <CheckCircle2 size={17} strokeWidth={2} />
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-primary text-xs">Public identity</p>
        <h2 className="mt-2 font-bold text-3xl text-ink leading-tight">
          {content.name}
        </h2>
        <p className="wrap-break-word mt-2 max-w-2xl text-slate-muted text-sm leading-relaxed">
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
