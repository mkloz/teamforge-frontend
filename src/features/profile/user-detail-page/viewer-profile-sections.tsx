import { PublicFriendsList } from "@/features/profile/components/profile-friends-panel/public-friends-list";
import { ProfileSectionHeading } from "@/features/profile/components/profile-section-heading";
import { OceanChart } from "@/shared/components/psychometrics/ocean-chart";
import type { ViewerProfile } from "@/shared/schemas/viewer-profile";

export function ViewerProfileSections({ profile }: { profile: ViewerProfile }) {
  const hasBio = Boolean(profile.bio?.trim());
  const hasInterests = profile.interests.length > 0;
  const hasPersonality = profile.personalityProfile !== null;
  const canShowFriends = profile.showFriendsListOnProfile;

  if (profile.viewerContext === "MINIMAL") {
    return <ViewerProfileAvailability />;
  }

  if (!hasBio && !hasInterests && !hasPersonality && !canShowFriends) {
    return <ViewerProfileEmptyDetails />;
  }

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      {hasBio ? <ViewerProfileAbout bio={profile.bio ?? ""} /> : null}
      {hasInterests ? (
        <ViewerProfileInterests interests={profile.interests} />
      ) : null}
      {profile.personalityProfile ? (
        <ViewerPersonalityProfile profile={profile.personalityProfile} />
      ) : null}
      {canShowFriends ? <ViewerFriends userId={profile.id} /> : null}
    </div>
  );
}

function ViewerFriends({ userId }: { userId: string }) {
  return (
    <section className="border-border/60 border-t pt-6">
      <ProfileSectionHeading>Friends</ProfileSectionHeading>
      <div className="mt-3 max-w-2xl">
        <PublicFriendsList userId={userId} />
      </div>
    </section>
  );
}

function ViewerProfileAvailability() {
  return (
    <section className="border-border/60 border-y py-5">
      <ProfileSectionHeading>Profile details</ProfileSectionHeading>
      <p className="mt-2 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
        Only basic profile details are available.
      </p>
    </section>
  );
}

function ViewerProfileEmptyDetails() {
  return (
    <section className="border-border/60 border-y py-5">
      <ProfileSectionHeading>Profile details</ProfileSectionHeading>
      <p className="mt-2 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
        No other profile details are available.
      </p>
    </section>
  );
}

function ViewerProfileAbout({ bio }: { bio: string }) {
  return (
    <section className="border-border/60 border-t pt-6">
      <ProfileSectionHeading>About</ProfileSectionHeading>
      <p className="mt-3 max-w-3xl text-pretty text-base text-ink/82 leading-relaxed">
        {bio}
      </p>
    </section>
  );
}

function ViewerProfileInterests({
  interests,
}: {
  interests: ViewerProfile["interests"];
}) {
  return (
    <section className="border-border/60 border-t pt-6">
      <ProfileSectionHeading>Interests</ProfileSectionHeading>
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
    </section>
  );
}

function ViewerPersonalityProfile({
  profile,
}: {
  profile: NonNullable<ViewerProfile["personalityProfile"]>;
}) {
  return (
    <section className="border-border/60 border-t pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <ProfileSectionHeading>Personality traits</ProfileSectionHeading>
        <span className="rounded-full bg-forge-teal px-3 py-1 font-bold text-white text-xs">
          {profile.personalityType}
        </span>
      </div>
      <div className="mt-4 w-full max-w-2xl">
        <OceanChart scores={profile.ocean} interactive={false} />
      </div>
    </section>
  );
}
