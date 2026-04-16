import type { UserProfile } from "../types/profile.types";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileIdentity } from "./profile-identity";
import { ProfileActions } from "./profile-actions";

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
            <ProfileAvatar src={profile.avatar} name={profile.name} />
            <ProfileIdentity profile={profile} />
          </div>
        </div>

        {/* Bottom Section (Quote & Actions) */}
        <div className="flex flex-col gap-6">
          <blockquote className="relative border-l-thick border-forge-teal/30 sm:pl-5 py-2 px-2 text-center sm:text-left">
            <p className="relative z-10 text-sm sm:text-lg text-ink font-medium leading-relaxed text-pretty italic opacity-85 max-w-2xl">
              "{profile.bio}"
            </p>
          </blockquote>

          <ProfileActions className="sm:hidden" />
        </div>
      </div>
    </div>
  );
}
