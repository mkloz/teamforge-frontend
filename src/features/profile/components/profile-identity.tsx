import { MapPin } from "lucide-react";
import type { UserProfile } from "../types/profile.types";
import { ProfileBadges } from "./profile-badges";
import { ProfileActions } from "./profile-actions";

interface ProfileIdentityProps {
  profile: UserProfile;
}

export function ProfileIdentity({ profile }: ProfileIdentityProps) {
  return (
    <div className="flex flex-col items-center sm:items-start justify-center min-w-0 flex-1 pt-2 sm:pt-0">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink sm:text-white leading-tight text-center sm:text-left text-balance drop-shadow-sm sm:drop-shadow-md">
        {profile.fullName}
      </h1>

      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-slate-muted sm:text-white/90 mt-2 font-medium">
        <span className="text-sm font-bold opacity-80">{profile.age} yrs</span>
        <span className="w-1 h-1 rounded-full bg-slate-muted/40 sm:bg-white/50" />
        <div className="flex items-center gap-1 text-micro font-bold uppercase tracking-widest min-w-0 opacity-80">
          <MapPin
            size={12}
            className="text-forge-teal sm:text-white shrink-0"
          />
          <span className="truncate">{profile.city}</span>
        </div>
      </div>

      {/* Universal Badges & Actions Row */}
      <div className="flex flex-col sm:flex-row w-full items-center sm:items-end justify-center sm:justify-between mt-5 sm:mt-10 gap-6 sm:gap-4 pb-1">
        <ProfileBadges profile={profile} />
        <ProfileActions className="hidden sm:flex" />
      </div>
    </div>
  );
}
