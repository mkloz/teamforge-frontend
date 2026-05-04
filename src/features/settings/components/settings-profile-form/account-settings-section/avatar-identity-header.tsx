import { Avatar } from "@/shared/components/common/avatar";
import type { User } from "@/shared/schemas";
import { CheckCircle2 } from "lucide-react";

interface AvatarIdentityHeaderProps {
  currentUser: User | undefined;
  displayedAvatarUrl: string | null | undefined;
}

export function AvatarIdentityHeader({
  currentUser,
  displayedAvatarUrl,
}: AvatarIdentityHeaderProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="hidden w-fit flex-col gap-2 sm:flex">
        <div className="relative">
          <Avatar
            src={displayedAvatarUrl}
            name={currentUser?.name}
            className="h-28 w-28 border border-border bg-card text-2xl shadow-sm"
            loading="eager"
          />
          <span className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-4 border-canvas bg-forge-teal text-white">
            <CheckCircle2 size={17} strokeWidth={2} />
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-forge-teal">
          Public identity
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-ink">
          {currentUser?.name ?? "Your account"}
        </h2>
        <p className="mt-2 max-w-2xl break-words text-sm leading-relaxed text-slate-muted">
          {currentUser?.bio ||
            "Add a short intro so people have an easier first step when your group opens."}
        </p>
      </div>
    </div>
  );
}
