import { ActivityPageLoading } from "@/features/activity/activity-page.loading";
import {
  EXPLORE_FEED_SKELETON_NAME,
  ExploreFeedSkeletonFixture,
} from "@/features/explore/components/explore-feed/explore-feed-skeleton-fixture";
import { ExploreLensSkeleton } from "@/features/explore/components/explore-left-section/explore-lens-skeleton";
import { RecentActivitySkeleton } from "@/features/forge/components/steps/step1-activity/recent-activity-row/recent-activity-skeleton";
import { TemplateSuggestionsSkeleton } from "@/features/forge/components/steps/step2-templates/template-suggestions-skeleton";
import { ManualFriendsSkeleton } from "@/features/forge/components/steps/step3-group/manual-friends-skeleton";
import { InterestsCatalogSkeleton } from "@/features/onboarding/components/interests/interests-page/interests-screen-renderer/interests-catalog-skeleton";
import {
  SettingsActiveSessionsSkeleton,
  SettingsBlockedUsersSkeleton,
  SettingsPreferencesSkeleton,
} from "@/features/settings/components/settings-section-skeletons";
import { GeneratedSkeleton } from "@/shared/components/loading/generated-skeleton";

export function BoneyardSectionSkeletonsPage() {
  const exploreFixture = <ExploreFeedSkeletonFixture />;

  return (
    <main className="min-h-screen bg-canvas px-4 py-6 text-foreground md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <GeneratedSkeleton
          name={EXPLORE_FEED_SKELETON_NAME}
          loading
          fixture={exploreFixture}
        >
          {exploreFixture}
        </GeneratedSkeleton>

        <div className="max-w-72">
          <ExploreLensSkeleton />
        </div>

        <RecentActivitySkeleton />

        <TemplateSuggestionsSkeleton />

        <div className="max-w-xl">
          <ManualFriendsSkeleton />
        </div>

        <div className="max-w-xl">
          <InterestsCatalogSkeleton />
        </div>

        <div className="relative h-160 overflow-hidden rounded-2xl border border-border/60">
          <ActivityPageLoading contained mode="route" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SettingsActiveSessionsSkeleton />
          </div>
          <div>
            <SettingsBlockedUsersSkeleton />
          </div>
          <div className="lg:col-span-2">
            <SettingsPreferencesSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}
