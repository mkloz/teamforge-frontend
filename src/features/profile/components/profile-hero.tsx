import type { User } from "@/shared/schemas";
import { ProfileActions } from "./profile-actions";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileIdentity } from "./profile-identity";

interface ProfileHeroProps {
  user: User;
  archetype: string;
}

export function ProfileHero({ user, archetype }: ProfileHeroProps) {
  return (
    <div className="relative flex flex-col pb-8 sm:pb-12 border-b border-border/50 sm:px-0 z-0 w-full">
      <div className="flex flex-col gap-6 w-full">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 min-w-0 flex-1">
            <ProfileAvatar src={user.avatar} name={user.name} />
            <ProfileIdentity user={user} archetype={archetype} />
          </div>
        </div>

        {/* Bottom Section (Quote & Actions) */}
        <div className="flex flex-col gap-6">
          <blockquote className="relative max-w-2xl">
            {user.bio ? (
              <p className="relative z-10 text-lg md:text-xl text-ink/80 font-medium leading-relaxed text-pretty">
                {user.bio}
              </p>
            ) : (
              <p className="relative z-10 text-base text-slate-muted font-medium leading-relaxed text-pretty">
                No bio yet. Add a short introduction in settings so people know
                what you are about.
              </p>
            )}
          </blockquote>

          <ProfileActions className="lg:hidden" />
        </div>
      </div>
    </div>
  );
}
