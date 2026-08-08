import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass } from "lucide-react";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { HomeRecommendedGroupsSkeleton } from "@/features/home/components/home-skeletons";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { getRecommendationPreview } from "@/features/home/lib/home-insights";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { useUnexpiredExploreFeedItems } from "@/shared/hooks/use-unexpired-explore-feed-items";
import { buildExploreNavigation } from "@/shared/navigation";
import type { ExploreFeedItem } from "@/shared/schemas";

import { OpenPlanRow } from "./open-plan-row";

export function RecommendedGroups() {
  const { recommendations, isError, isRecommendationsLoading, refetchAll } =
    useHomeData({
      include: {
        recommendations: true,
      },
    });

  return (
    <RecommendedGroupsView
      isRecommendationsLoading={isRecommendationsLoading}
      isRecommendationsError={isError}
      onRetry={() => void refetchAll()}
      recommendations={recommendations}
    />
  );
}

interface RecommendedGroupsViewProps {
  isRecommendationsError?: boolean;
  isRecommendationsLoading?: boolean;
  onRetry?: () => void;
  recommendations: ExploreFeedItem[];
}

function RecommendedGroupsView({
  isRecommendationsError = false,
  isRecommendationsLoading = false,
  onRetry,
  recommendations,
}: RecommendedGroupsViewProps) {
  const currentRecommendations = useUnexpiredExploreFeedItems(recommendations);
  const visibleRecommendations = getRecommendationPreview(
    currentRecommendations,
    4,
  );

  return (
    <section
      aria-labelledby="recommended-groups-heading"
      className="flex w-full min-w-0 flex-col gap-5 lg:border-border/60 lg:border-l lg:pl-10"
    >
      <HomeSectionHeading
        id="recommended-groups-heading"
        title="Open plans"
        description="Opportunities in and around you."
        action={
          visibleRecommendations.length > 0 ? (
            <Button asChild variant="ghost" size="sm">
              <Link {...buildExploreNavigation()}>
                View all
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          ) : null
        }
      />

      {isRecommendationsError && visibleRecommendations.length === 0 ? (
        <div
          className="flex min-h-36 items-center justify-between gap-4 rounded-lg bg-destructive/6 px-3 py-5 shadow-soft-sm sm:px-4"
          role="alert"
        >
          <div className="min-w-0">
            <p className="font-bold text-foreground text-sm">
              We couldn't load open plans.
            </p>
            <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed">
              Check your connection and try again.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : isRecommendationsLoading && recommendations.length === 0 ? (
        <HomeRecommendedGroupsSkeleton />
      ) : visibleRecommendations.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Nothing open right now."
          description="New plans with an open place will appear here."
        />
      ) : (
        <ul className="list-none p-0">
          {visibleRecommendations.map((recommendation) => (
            <OpenPlanRow
              key={getRecommendationKey(recommendation)}
              recommendation={recommendation}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function getRecommendationKey(recommendation: ExploreFeedItem) {
  if (recommendation.type === "FORMATION_OPENING") {
    return `opening-${recommendation.opening.id}`;
  }

  return `${recommendation.type.toLowerCase()}-${recommendation.group.id}`;
}
