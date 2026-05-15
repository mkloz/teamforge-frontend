import { Link } from "@tanstack/react-router";
import { EmptyRecommendationsVisual } from "@/assets/empty-state/empty-recommendations";
import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { HomeRecommendedGroupsSkeleton } from "@/features/home/components/home-skeletons";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { getRecommendationPreview } from "@/features/home/lib/home-insights";
import { Button } from "@/shared/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/components/ui/carousel";
import type { ExploreGroup } from "@/shared/schemas";

import { RecommendedGroupCard } from "./recommended-group-card";

export function RecommendedGroups() {
  const { recommendations, isRecommendationsLoading } = useHomeData();

  return (
    <RecommendedGroupsView
      isRecommendationsLoading={isRecommendationsLoading}
      recommendations={recommendations}
    />
  );
}

interface RecommendedGroupsViewProps {
  isRecommendationsLoading?: boolean;
  recommendations: ExploreGroup[];
}

export function RecommendedGroupsView({
  isRecommendationsLoading = false,
  recommendations,
}: RecommendedGroupsViewProps) {
  const visibleRecommendations = getRecommendationPreview(recommendations, 3);

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
        title="Groups worth a look"
        description="A couple of openings to inspect, not automatic yeses."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link {...buildExploreNavigation()}>Explore</Link>
          </Button>
        }
      />

      {visibleRecommendations.length === 0 ? (
        <div className="flex items-center gap-3 border-border/70 border-y border-dashed bg-card/40 px-3 py-5 sm:px-4">
          <EmptyRecommendationsVisual className="w-16 shrink-0 text-foreground sm:w-20" />
          <div className="min-w-0">
            <p className="font-black text-foreground text-sm">
              No strong openings yet.
            </p>
            <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed">
              When a group looks like a good fit, it will show up here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full overflow-hidden md:hidden">
            <Carousel
              opts={{
                align: "center",
                loop: visibleRecommendations.length > 1,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3 pt-1 pb-2">
                {visibleRecommendations.map((recommendation) => (
                  <CarouselItem
                    key={recommendation.id}
                    className={
                      visibleRecommendations.length > 1
                        ? "min-w-0 basis-80 pl-3"
                        : "min-w-0 basis-full pl-3"
                    }
                  >
                    <div className="w-full min-w-0">
                      <RecommendedGroupCard group={recommendation} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          <ul className="hidden list-none p-0 md:grid md:grid-cols-2 md:gap-5 xl:grid-cols-3">
            {visibleRecommendations.map((recommendation) => (
              <li key={recommendation.id} className="min-w-0">
                <RecommendedGroupCard group={recommendation} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
