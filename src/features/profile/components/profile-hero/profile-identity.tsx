import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { Button } from "@/shared/components/ui/button";
import type { User } from "@/shared/schemas";
import { ProfileActions } from "./profile-actions";
import { ProfileBadges } from "./profile-badges";

interface ProfileIdentityProps {
  user: User;
  archetype: string;
  actions?: ReactNode;
  showMissingDetailsAction?: boolean;
  onOpenFriends?: (tab: "friends" | "requests" | "public_friends") => void;
}

export function ProfileIdentity({
  user,
  archetype,
  actions = <ProfileActions />,
  showMissingDetailsAction = true,
  onOpenFriends,
}: ProfileIdentityProps) {
  const hasAge = typeof user.age === "number";
  const hasCity = Boolean(user.city);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-start justify-center pt-0">
      <h1 className="text-balance text-left font-bold text-3xl text-white leading-tight tracking-tight sm:text-4xl">
        {user.name}
      </h1>

      <div className="flex flex-wrap items-center justify-start gap-x-2 gap-y-1 font-medium text-white/80">
        {hasAge ? (
          <span className="font-semibold text-sm">{user.age} yrs</span>
        ) : null}
        {hasAge && hasCity ? (
          <span className="size-1 rounded-full bg-white/40" />
        ) : null}
        {hasCity ? (
          <div className="flex min-w-0 items-center gap-1 font-semibold text-sm leading-4">
            <MapPin
              aria-hidden="true"
              className="size-3 shrink-0 -translate-y-px text-white/90"
            />
            <span className="truncate leading-4">{user.city}</span>
          </div>
        ) : null}
        {!hasAge && !hasCity ? (
          <div className="flex flex-col items-start gap-2">
            <span className="text-sm text-white/80">
              Profile details are still being filled in.
            </span>
            {showMissingDetailsAction ? (
              <Button asChild variant="outline" size="sm">
                <Link {...buildSettingsNavigation("account")}>
                  Finish account details
                </Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Universal Badges & Actions Row */}
      <div className="mt-2 flex w-full flex-col items-start justify-center gap-5 pb-1 sm:mt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <ProfileBadges
          user={user}
          archetype={archetype}
          onOpenFriends={onOpenFriends}
        />
        <div className="hidden lg:flex">{actions}</div>
      </div>
    </div>
  );
}
