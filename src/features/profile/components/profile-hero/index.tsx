import type { ReactNode, Ref } from "react";
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
  heroRowRef?: Ref<HTMLDivElement>;
}

export function ProfileHero({
  user,
  archetype,
  socialRead,
  renderActions = () => <ProfileActions />,
  showMissingDetailsAction = true,
  heroRowRef,
}: ProfileHeroProps) {
  const hasBio = Boolean(user.bio?.trim());

  return (
    <div className="relative flex w-full flex-col pb-4 sm:px-0 sm:pb-8">
      <div className="flex w-full flex-col gap-5 sm:gap-6 lg:gap-9">
        <div className="flex w-full flex-col justify-between gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative min-w-0 flex-1">
            <div
              ref={heroRowRef}
              className="transform-[translate3d(0,var(--profile-hero-original-y,0px),0)] relative top-2 flex w-full min-w-0 flex-row items-start gap-4 opacity-(--profile-hero-original-opacity,1) transition-[opacity,transform] duration-300 ease-out [transition-delay:var(--profile-hero-original-delay,0ms)] motion-reduce:transition-none sm:top-1 sm:gap-6 md:top-5"
            >
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
        </div>

        <ExpandedProfileSummary
          hasBio={hasBio}
          socialRead={socialRead}
          userBio={user.bio}
        >
          <div className="lg:hidden">{renderActions()}</div>
        </ExpandedProfileSummary>
      </div>
    </div>
  );
}

interface ExpandedProfileSummaryProps {
  children: ReactNode;
  hasBio: boolean;
  socialRead: string;
  userBio?: string | null;
}

function ExpandedProfileSummary({
  children,
  hasBio,
  socialRead,
  userBio,
}: ExpandedProfileSummaryProps) {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <blockquote className="relative max-w-136 sm:mx-0 sm:max-w-2xl">
        {hasBio ? (
          <p className="relative z-10 text-pretty font-medium text-base text-ink/82 leading-relaxed md:text-xl">
            {userBio}
          </p>
        ) : (
          <p className="relative z-10 text-pretty font-medium text-base text-ink/82 leading-relaxed md:text-xl">
            {socialRead}
          </p>
        )}
      </blockquote>

      {children}
    </div>
  );
}
