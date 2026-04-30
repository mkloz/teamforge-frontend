import { MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { User } from "@/shared/schemas";
import { buildSettingsNavigation } from "@/shared/lib/settings-route";
import { ProfileActions } from "./profile-actions";
import { ProfileBadges } from "./profile-badges";
import { Button } from "@/shared/components/ui/button";

interface ProfileIdentityProps {
  user: User;
  archetype: string;
}

export function ProfileIdentity({ user, archetype }: ProfileIdentityProps) {
  const hasAge = typeof user.age === "number";
  const hasCity = Boolean(user.city);

  return (
    <div className="flex flex-col items-center sm:items-start justify-center min-w-0 flex-1 pt-2 sm:pt-0">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink sm:text-white leading-tight text-center sm:text-left text-balance">
        {user.name}
      </h1>

      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-slate-muted sm:text-white/80 mt-1.5 font-medium">
        {hasAge ? (
          <span className="text-sm font-semibold">{user.age} yrs</span>
        ) : null}
        {hasAge && hasCity ? (
          <span className="w-1 h-1 rounded-full bg-slate-muted/30 sm:bg-white/40" />
        ) : null}
        {hasCity ? (
          <div className="flex items-center gap-1 text-micro font-bold uppercase tracking-widest min-w-0">
            <MapPin
              size={12}
              className="text-forge-teal sm:text-white/90 shrink-0"
            />
            <span className="truncate">{user.city}</span>
          </div>
        ) : null}
        {!hasAge && !hasCity ? (
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <span className="text-sm">
              Profile details are still being filled in.
            </span>
            <Button asChild variant="outline" size="sm">
              <Link {...buildSettingsNavigation("account")}>
                Finish account details
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      {/* Universal Badges & Actions Row */}
      <div className="flex flex-col sm:flex-row w-full items-center sm:items-end justify-center sm:justify-between mt-5 sm:mt-10 gap-6 sm:gap-4 pb-1">
        <ProfileBadges user={user} archetype={archetype} />
        <ProfileActions className="hidden lg:flex" />
      </div>
    </div>
  );
}
