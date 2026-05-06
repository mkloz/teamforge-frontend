import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { Button } from "@/shared/components/ui/button";
import type { User } from "@/shared/schemas";
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { ProfileActions } from "./profile-actions";
import { ProfileBadges } from "./profile-badges";

interface ProfileIdentityProps {
  user: User;
  archetype: string;
}

export function ProfileIdentity({ user, archetype }: ProfileIdentityProps) {
  const hasAge = typeof user.age === "number";
  const hasCity = Boolean(user.city);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center pt-0 sm:items-start">
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tight text-ink text-balance sm:text-left sm:text-4xl sm:text-white">
        {user.name}
      </h1>

      <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-medium text-slate-muted sm:justify-start sm:text-white/80">
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
      <div className="mt-4 flex w-full flex-col items-center justify-center gap-5 pb-1 sm:mt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <ProfileBadges user={user} archetype={archetype} />
        <div className="hidden lg:flex">
          <ProfileActions />
        </div>
      </div>
    </div>
  );
}
