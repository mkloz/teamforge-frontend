import { Link } from "@tanstack/react-router";
import { FriendsList } from "@/features/profile/components/profile-friends-panel/friends-list";
import { ProfileSectionHeading } from "@/features/profile/components/profile-section-heading";
import { Button } from "@/shared/components/ui/button";
import { buildInterestsEditNavigation } from "@/shared/navigation/onboarding-navigation";
import type { User } from "@/shared/schemas";

export function SelfProfileSections({ profile }: { profile: User }) {
  return (
    <div className="flex flex-col gap-8 border-border/60 border-t pt-6 sm:pt-8 lg:gap-10">
      <ProfileInterests interests={profile.interests ?? []} />
      <ProfileFriends />
    </div>
  );
}

function ProfileInterests({
  interests,
}: {
  interests: NonNullable<User["interests"]>;
}) {
  return (
    <section className="min-w-0 max-w-4xl">
      <ProfileSectionHeading>Interests</ProfileSectionHeading>
      {interests.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {interests.map((interest) => (
            <span
              key={interest.id}
              className="inline-flex min-h-8 max-w-full items-center rounded-full border border-forge-teal/20 bg-forge-teal/8 px-3 font-semibold text-forge-teal text-xs leading-snug"
            >
              {interest.name}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-col items-start gap-3">
          <p className="max-w-md text-pretty text-slate-muted text-sm leading-relaxed">
            Add a few interests so your profile reflects the plans you would
            actually join.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link
              {...buildInterestsEditNavigation({
                returnTo: "/profile",
              })}
            >
              Add interests
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}

function ProfileFriends() {
  return (
    <section className="min-w-0 border-border/60 border-t pt-6">
      <ProfileSectionHeading>Friends</ProfileSectionHeading>
      <div className="mt-2">
        <FriendsList className="grid max-w-4xl gap-x-8 gap-y-1 sm:grid-cols-2" />
      </div>
    </section>
  );
}
