import type { UserProfile } from "../types/profile.types";
import { ProfileActions } from "./profile-actions";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileIdentity } from "./profile-identity";

interface ProfileHeroProps {
  profile: UserProfile;
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  return (
    <div className="relative flex flex-col pb-8 sm:pb-12 border-b border-border/50 sm:px-0 z-0 w-full">
      <div className="flex flex-col gap-6 w-full">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 min-w-0 flex-1">
            <ProfileAvatar src={profile.avatar} fullName={profile.fullName} />
            <ProfileIdentity profile={profile} />
          </div>
        </div>

        {/* Bottom Section (Quote & Actions) */}
        <div className="flex flex-col gap-6">
          <blockquote className="relative max-w-2xl">
            <p className="relative z-10 text-lg md:text-xl text-ink/80 font-medium leading-relaxed text-pretty">
              {profile.bio}
            </p>
          </blockquote>

          <ProfileActions className="lg:hidden" />
        </div>
      </div>
    </div>
  );
}
