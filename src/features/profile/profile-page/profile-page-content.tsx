import type { ReactNode } from "react";
import { ActivityLanesSection } from "@/features/profile/components/activity-lanes-section";
import { BestFirstGroupStrip } from "@/features/profile/components/best-first-group-strip";
import { GroupFitSection } from "@/features/profile/components/group-fit-section";
import { MatchingSnapshot } from "@/features/profile/components/matching-snapshot";
import { ProfileHero } from "@/features/profile/components/profile-hero";
import { ProfilePortraitSection } from "@/features/profile/components/profile-portrait-section";
import { PsychometricsSidebar } from "@/features/profile/components/psychometrics-sidebar";
import { UserMenu } from "@/features/user-menu/components/user-menu";
import type { User } from "@/shared/schemas";

import { ProfileCoverBanner } from "./profile-cover-banner";
import { buildProfilePageModel } from "./profile-page-model";

interface ProfilePageContentProps {
  profile: User;
  mode?: "self" | "public";
  renderActions?: () => ReactNode;
  showUserMenu?: boolean;
}

export function ProfilePageContent({
  mode = "self",
  profile,
  renderActions,
  showUserMenu,
}: ProfilePageContentProps) {
  const pageModel = buildProfilePageModel(profile);
  const shouldShowUserMenu = showUserMenu ?? mode === "self";

  return (
    <main className="relative min-h-full overflow-x-hidden bg-canvas pb-32 md:pb-0">
      <ProfileCoverBanner personalityType={profile.personalityType} />

      {shouldShowUserMenu ? (
        <div className="absolute top-4 right-4 z-50 md:top-6 md:right-8">
          <UserMenu trigger="settings" />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-8 px-4 pt-14 pb-24 sm:max-w-6xl sm:px-6 sm:pt-16 md:px-8 md:pt-20 lg:gap-12 lg:pb-16">
        <ProfileHero
          user={profile}
          archetype={pageModel.archetype}
          socialRead={pageModel.socialRead}
          renderActions={renderActions}
          showMissingDetailsAction={mode === "self"}
        />

        <ProfilePortraitSection portrait={pageModel.profileInsights.portrait} />

        <BestFirstGroupStrip
          activityIdeas={pageModel.profileInsights.activityIdeas}
        />

        <div className="lg:profile-page-grid grid gap-9 lg:gap-16">
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
