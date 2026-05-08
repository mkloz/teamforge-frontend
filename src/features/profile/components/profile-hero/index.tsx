import type { User } from "@/shared/schemas";
import { ProfileActions } from "./profile-actions";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileIdentity } from "./profile-identity";

interface ProfileHeroProps {
  user: User;
  archetype: string;
  socialRead: string;
}

export function ProfileHero({ user, archetype, socialRead }: ProfileHeroProps) {
  const hasBio = Boolean(user.bio?.trim());

  return (
    <div className="relative z-0 flex w-full flex-col pb-4 sm:px-0 sm:pb-8">
      <div className="flex w-full flex-col gap-5 sm:gap-6">
        <div className="flex w-full flex-col justify-between gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative top-2 flex min-w-0 flex-1 flex-col items-center gap-3 sm:top-1 sm:flex-row sm:items-start sm:gap-6 md:top-5">
            <ProfileAvatar src={user.avatar} name={user.name} />
            <ProfileIdentity user={user} archetype={archetype} />
          </div>
        </div>

        <div className="flex flex-col gap-5 sm:gap-6">
          <blockquote className="relative mx-auto max-w-[34rem] sm:mx-0 sm:max-w-2xl">
            {hasBio ? (
              <p className="relative z-10 text-pretty text-center font-medium text-base text-ink/82 leading-relaxed sm:text-left md:text-xl">
                {user.bio}
              </p>
            ) : (
              <p className="relative z-10 text-pretty text-center font-medium text-base text-ink/82 leading-relaxed sm:text-left md:text-xl">
                {socialRead}
              </p>
            )}
          </blockquote>

          <div className="lg:hidden">
            <ProfileActions />
          </div>
        </div>
      </div>
    </div>
  );
}
