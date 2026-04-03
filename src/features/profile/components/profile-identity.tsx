import { MapPin } from "lucide-react";
import type { UserProfile } from "../types/profile.types";
import { ProfileBadges } from "./profile-badges";

interface ProfileIdentityProps {
  profile: UserProfile;
}

export function ProfileIdentity({ profile }: ProfileIdentityProps) {
  return (
    <div className="flex flex-col items-center sm:items-start justify-center min-w-0 flex-1 pt-2 sm:pt-0">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink sm:text-white leading-tight text-center sm:text-left text-balance drop-shadow-sm sm:drop-shadow-md">
        {profile.name}
      </h1>

      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-slate-muted sm:text-white/90 mt-2 font-medium">
        <span className="text-sm font-bold opacity-80">{profile.age} yrs</span>
        <span className="w-1 h-1 rounded-full bg-slate-muted/40 sm:bg-white/50" />
        <div className="flex items-center gap-1 text-micro font-bold uppercase tracking-widest min-w-0 opacity-80">
          <MapPin
            size={12}
            className="text-forge-teal sm:text-white shrink-0"
          />
          <span className="truncate">{profile.location}</span>
        </div>
      </div>

      {/* Universal Badges Row */}
      <div className="flex w-full items-center justify-center sm:justify-start mt-5 sm:mt-8 scrollbar-none pb-1 relative left-0">
        <ProfileBadges profile={profile} />
      </div>
    </div>
  );
}
