import { ActivityLanesSection } from "@/features/profile/components/activity-lanes-section";
import { BestFirstGroupStrip } from "@/features/profile/components/best-first-group-strip";
import { GroupFitSection } from "@/features/profile/components/group-fit-section";
import { MatchingSnapshot } from "@/features/profile/components/matching-snapshot";
import { ProfileHero } from "@/features/profile/components/profile-hero";
import { ProfilePortraitSection } from "@/features/profile/components/profile-portrait-section";
import { PsychometricsSidebar } from "@/features/profile/components/psychometrics-sidebar";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { UserMenu } from "@/features/user-menu/components/user-menu";

import { ProfileCoverBanner } from "./profile-cover-banner";
import { ProfilePageError } from "./profile-page-error";
import { buildProfilePageModel } from "./profile-page-model";
import { ProfilePageSkeleton } from "./profile-page-skeleton";

export function ProfilePage() {
  const { profile, isLoading, error, refetch } = useProfile();

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (error || !profile) {
    return <ProfilePageError onRetry={() => void refetch()} />;
  }

  const pageModel = buildProfilePageModel(profile);

  return (
    <main className="relative min-h-full overflow-x-hidden bg-canvas pb-32 md:pb-0">
      <ProfileCoverBanner personalityType={profile.personalityType} />

      <div className="absolute top-4 right-4 z-50 md:top-6 md:right-8">
        <UserMenu trigger="settings" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[32rem] flex-col gap-8 px-4 pt-14 pb-24 sm:max-w-6xl sm:px-6 sm:pt-16 md:px-8 md:pt-20 lg:gap-12 lg:pb-16">
        <ProfileHero
          user={profile}
          archetype={pageModel.archetype}
          socialRead={pageModel.socialRead}
        />

        <ProfilePortraitSection portrait={pageModel.profileInsights.portrait} />

        <BestFirstGroupStrip
          activityIdeas={pageModel.profileInsights.activityIdeas}
        />

        <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
            <GroupFitSection insight={pageModel.profileInsights.groupFit} />
            <ActivityLanesSection
              lanes={pageModel.profileInsights.activityLanes}
            />
            <MatchingSnapshot
              signals={pageModel.profileInsights.matchingSignals}
            />
          </div>

          <div className="flex min-w-0 shrink-0 flex-col">
            <PsychometricsSidebar
              oceanScores={pageModel.oceanScores}
              dimensionScores={pageModel.dimensionScores}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
