import { MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { ProfileCoverBanner } from "@/features/profile/profile-page/profile-cover-banner";
import { Avatar } from "@/shared/components/common/avatar";
import type { ViewerProfile } from "@/shared/schemas/viewer-profile";
import { ViewerProfileSections } from "./viewer-profile-sections";

interface ViewerProfilePageContentProps {
  actions: ReactNode;
  profile: ViewerProfile;
}

export function ViewerProfilePageContent({
  actions,
  profile,
}: ViewerProfilePageContentProps) {
  const personalityType = profile.personalityProfile?.personalityType ?? null;

  return (
    <div className="relative min-h-full overflow-x-clip bg-canvas [--personality-cover-type-opacity:0.82] [--personality-cover-type-scale:1] [--personality-cover-type-y:0px] [--profile-cover-expanded-height:160px] sm:[--profile-cover-expanded-height:168px] md:[--profile-cover-expanded-height:152px]">
      <ProfileCoverBanner personalityType={personalityType} />

      <main className="relative z-40 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-24 pb-10 sm:px-6 md:px-8 md:pt-16 lg:gap-12 lg:pb-16">
        <ViewerProfileHero actions={actions} profile={profile} />
        <ViewerProfileSections profile={profile} />
      </main>
    </div>
  );
}

function ViewerProfileHero({
  actions,
  profile,
}: ViewerProfilePageContentProps) {
  return (
    <section className="flex min-w-0 flex-col gap-6 pb-4 sm:pb-8">
      <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <Avatar
          media={profile.avatarMedia}
          src={profile.avatar}
          name={profile.name}
          className="size-26 border-canvas border-thick bg-muted text-2xl shadow-lg ring-1 ring-border/70 sm:size-34 sm:text-4xl"
          fallbackClassName="bg-muted text-forge-teal text-2xl sm:text-4xl"
          imageSize={128}
          loading="eager"
        />

        <div className="min-w-0 flex-1 pt-1 md:pt-5">
          <h1 className="text-balance font-bold text-3xl text-white leading-tight tracking-tight sm:text-4xl">
            {profile.name}
          </h1>
          <ViewerProfileMeta profile={profile} />
          <div className="mt-5">{actions}</div>
        </div>
      </div>
    </section>
  );
}

function ViewerProfileMeta({ profile }: { profile: ViewerProfile }) {
  const items = getViewerProfileMetaItems(profile);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-sm text-white/80">
      {items.map((item, index) => (
        <div key={item.kind} className="flex min-w-0 items-center gap-2">
          {index > 0 ? (
            <span
              aria-hidden="true"
              className="size-1 rounded-full bg-white/40"
            />
          ) : null}
          {item.kind === "city" ? (
            <span className="flex min-w-0 items-center gap-1">
              <MapPin aria-hidden="true" className="size-3 shrink-0" />
              <span className="truncate">{item.value}</span>
            </span>
          ) : (
            <span>{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function getViewerProfileMetaItems(profile: ViewerProfile) {
  return [
    typeof profile.age === "number"
      ? { kind: "age", value: `${profile.age} yrs` }
      : null,
    profile.city ? { kind: "city", value: profile.city } : null,
    profile.gender
      ? { kind: "gender", value: formatGender(profile.gender) }
      : null,
  ].filter(
    (item): item is { kind: "age" | "city" | "gender"; value: string } =>
      item !== null,
  );
}

function formatGender(gender: NonNullable<ViewerProfile["gender"]>) {
  switch (gender) {
    case "MALE":
      return "Male";
    case "FEMALE":
      return "Female";
    case "NON_BINARY":
      return "Non-binary";
    case "OTHER":
      return "Other";
  }

  return "Other";
}
