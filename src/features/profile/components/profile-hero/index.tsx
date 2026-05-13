import type { ReactNode } from "react";
import type { User } from "@/shared/schemas";
import { ProfileActions } from "./profile-actions";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileIdentity } from "./profile-identity";

interface ProfileHeroProps {
  user: User;
  archetype: string;
  socialRead: string;
  renderActions?: () => ReactNode;
  showMissingDetailsAction?: boolean;
}

export function ProfileHero({
  user,
  archetype,
  socialRead,
  renderActions = () => <ProfileActions />,
  showMissingDetailsAction = true,
}: ProfileHeroProps) {
  const hasBio = Boolean(user.bio?.trim());

  return (
    <div className="relative z-0 flex w-full flex-col pb-4 sm:px-0 sm:pb-8">
      <div className="flex w-full flex-col gap-5 sm:gap-6 lg:gap-9">
        <div className="flex w-full flex-col justify-between gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative top-2 flex min-w-0 flex-1 flex-row items-start gap-4 sm:top-1 sm:gap-6 md:top-5">
            <ProfileAvatar
              src={user.avatar}
              name={user.name}
              onlineStatus={user.onlineStatus ?? "ONLINE"}
            />
            <ProfileIdentity
              user={user}
              archetype={archetype}
              actions={renderActions()}
              showMissingDetailsAction={showMissingDetailsAction}
            />
          </div>
        </div>

        <div className="flex flex-col gap-5 sm:gap-6">
          <blockquote className="relative max-w-136 sm:mx-0 sm:max-w-2xl">
            {hasBio ? (
              <p className="relative z-10 text-pretty font-medium text-base text-ink/82 leading-relaxed md:text-xl">
                {user.bio}
              </p>
            ) : (
              <p className="relative z-10 text-pretty font-medium text-base text-ink/82 leading-relaxed md:text-xl">
                {socialRead}
              </p>
            )}
          </blockquote>

          <div className="lg:hidden">{renderActions()}</div>
        </div>
      </div>
    </div>
  );
}
