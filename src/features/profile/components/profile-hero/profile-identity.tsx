import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { buildSettingsNavigation } from "@/shared/navigation/settings-navigation";
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
  actions,
  showMissingDetailsAction = true,
  onOpenFriends,
}: ProfileIdentityProps) {
  const profileDetails = getProfileIdentityDetails(user);
  const profileActions = actions ?? <ProfileActions />;

  return (
    <div className="flex min-w-0 flex-1 flex-col items-start justify-center pt-0">
      <h1 className="text-balance text-left font-bold text-3xl text-white leading-tight tracking-tight sm:text-4xl">
        {user.name}
      </h1>

      <ProfileIdentityDetails
        details={profileDetails}
        showMissingDetailsAction={showMissingDetailsAction}
        user={user}
      />

      {/* Universal Badges & Actions Row */}
      <div className="mt-2 flex w-full flex-col items-start justify-center gap-5 pb-1 sm:mt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <ProfileBadges
          user={user}
          archetype={archetype}
          onOpenFriends={onOpenFriends}
        />
        <div className="hidden lg:flex">{profileActions}</div>
      </div>
    </div>
  );
}

function ProfileIdentityDetails({
  details,
  showMissingDetailsAction,
  user,
}: {
  details: ProfileIdentityDetailsState;
  showMissingDetailsAction: boolean;
  user: User;
}) {
  return (
    <div className="flex flex-wrap items-center justify-start gap-x-2 gap-y-1 font-medium text-white/80">
      {details.hasAge ? <ProfileAge age={user.age} /> : null}
      {shouldShowProfileIdentitySeparator(details) ? <ProfileDot /> : null}
      {details.hasCity ? <ProfileCity city={user.city} /> : null}
      {details.isMissingDetails ? (
        <MissingProfileDetailsPrompt
          showMissingDetailsAction={showMissingDetailsAction}
        />
      ) : null}
    </div>
  );
}

function ProfileAge({ age }: { age: number | null | undefined }) {
  return <span className="font-semibold text-sm">{age} yrs</span>;
}

function ProfileDot() {
  return <span className="size-1 rounded-full bg-white/40" />;
}

function ProfileCity({ city }: { city: string | null | undefined }) {
  return (
    <div className="flex min-w-0 items-center gap-1 font-semibold text-sm leading-4">
      <MapPin
        aria-hidden="true"
        className="size-3 shrink-0 -translate-y-px text-white/90"
      />
      <span className="truncate leading-4">{city}</span>
    </div>
  );
}

function MissingProfileDetailsPrompt({
  showMissingDetailsAction,
}: {
  showMissingDetailsAction: boolean;
}) {
  return (
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
  );
}

interface ProfileIdentityDetailsState {
  hasAge: boolean;
  hasCity: boolean;
  isMissingDetails: boolean;
}

function getProfileIdentityDetails(user: User): ProfileIdentityDetailsState {
  const hasAge = hasProfileAge(user);
  const hasCity = hasProfileCity(user);

  return {
    hasAge,
    hasCity,
    isMissingDetails: isMissingProfileIdentityDetails({ hasAge, hasCity }),
  };
}

function hasProfileAge(user: User) {
  return typeof user.age === "number";
}

function hasProfileCity(user: User) {
  return Boolean(user.city);
}

function isMissingProfileIdentityDetails({
  hasAge,
  hasCity,
}: Pick<ProfileIdentityDetailsState, "hasAge" | "hasCity">) {
  return !hasAge && !hasCity;
}

function shouldShowProfileIdentitySeparator({
  hasAge,
  hasCity,
}: Pick<ProfileIdentityDetailsState, "hasAge" | "hasCity">) {
  return hasAge && hasCity;
}
