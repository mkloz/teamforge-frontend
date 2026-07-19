import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { EmptyRecommendationsVisual } from "@/features/home/assets/empty-recommendations";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { HomeRecommendedGroupsSkeleton } from "@/features/home/components/home-skeletons";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { getRecommendationPreview } from "@/features/home/lib/home-insights";
import { FormationOpeningReportAction } from "@/features/reporting/public/reporting";
import { FormationOpeningCard } from "@/shared/components/formation-opening-card";
import { Button } from "@/shared/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/components/ui/carousel";
import { useUnexpiredExploreFeedItems } from "@/shared/hooks/use-unexpired-explore-feed-items";
import { buildExploreNavigation } from "@/shared/navigation";
import type { ExploreFeedItem } from "@/shared/schemas";

import { RecommendedGroupCard } from "./recommended-group-card";

export function RecommendedGroups() {
  const { recommendations, isRecommendationsLoading } = useHomeData({
    include: {
      recommendations: true,
    },
  });

  return (
    <RecommendedGroupsView
      isRecommendationsLoading={isRecommendationsLoading}
      recommendations={recommendations}
    />
  );
}

interface RecommendedGroupsViewProps {
  isRecommendationsLoading?: boolean;
  recommendations: ExploreFeedItem[];
}

function RecommendedGroupsView({
  isRecommendationsLoading = false,
  recommendations,
}: RecommendedGroupsViewProps) {
  const currentRecommendations = useUnexpiredExploreFeedItems(recommendations);
  const visibleRecommendations = getRecommendationPreview(
    currentRecommendations,
    3,
  );

  if (isRecommendationsLoading && recommendations.length === 0) {
    return <HomeRecommendedGroupsSkeleton />;
  }

  return (
    <section
      aria-labelledby="recommended-groups-heading"
      className="flex w-full flex-col gap-5"
    >
      <HomeSectionHeading
        id="recommended-groups-heading"
        eyebrow="Discovery"
        title="Plans worth a look"
        description="Public groups and plans with a place open."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link {...buildExploreNavigation()}>
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      {visibleRecommendations.length === 0 ? (
        <div className="flex min-h-36 items-center justify-center gap-3 border-border/70 border-y border-dashed px-3 py-5 sm:px-4">
          <EmptyRecommendationsVisual className="h-11 w-auto shrink-0 text-foreground sm:h-12" />
          <div className="min-w-0">
            <p className="font-bold text-foreground text-sm">
              Nothing open right now.
            </p>
            <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed">
              Public groups and open places will appear here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden md:hidden">
            <Carousel
              opts={{
                align: "start",
                loop: visibleRecommendations.length > 1,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3 pt-1 pb-2 pl-4 sm:pl-5">
                {visibleRecommendations.map((recommendation) => (
                  <CarouselItem
                    key={getRecommendationKey(recommendation)}
                    className={
                      visibleRecommendations.length > 1
                        ? "min-w-0 basis-[calc(100vw-2.5rem)] pl-3"
                        : "min-w-0 basis-[calc(100vw-2rem)] pl-3"
                    }
                  >
                    <div className="w-full min-w-0">
                      <RecommendationCard recommendation={recommendation} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          <ul className="responsive-card-grid hidden list-none gap-5 p-0 md:grid">
            {visibleRecommendations.map((recommendation) => (
              <li
                key={getRecommendationKey(recommendation)}
                className="min-w-0"
              >
                <RecommendationCard recommendation={recommendation} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function RecommendationCard({
  recommendation,
}: {
  recommendation: ExploreFeedItem;
}) {
  return recommendation.type === "GROUP" ? (
    <RecommendedGroupCard group={recommendation.group} />
  ) : (
    <FormationOpeningCard
      opening={recommendation.opening}
      safetyAction={
        <FormationOpeningReportAction
          activityId={recommendation.opening.activity.id}
          activityTitle={recommendation.opening.activity.title}
        />
      }
      variant="compact"
    />
  );
}

function getRecommendationKey(recommendation: ExploreFeedItem) {
  return recommendation.type === "GROUP"
    ? `group-${recommendation.group.id}`
    : `opening-${recommendation.opening.id}`;
}
