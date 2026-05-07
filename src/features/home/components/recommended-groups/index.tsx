import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { getRecommendationPreview } from "@/features/home/lib/home-insights";
import { Button } from "@/shared/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/components/ui/carousel";

import { RecommendedGroupCard } from "./recommended-group-card";

export function RecommendedGroups() {
  const { recommendations, isRecommendationsLoading } = useHomeData();
  const visibleRecommendations = getRecommendationPreview(recommendations, 3);

  if (isRecommendationsLoading && recommendations.length === 0) {
    return (
      <div className="flex w-full animate-pulse flex-col gap-4">
        <div className="h-8 w-56 rounded bg-muted" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-48 rounded-xl bg-muted" />
          <div className="h-48 rounded-xl bg-muted/60" />
        </div>
      </div>
    );
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
        <div className="flex items-center gap-3 border-y border-dashed border-border/70 bg-card/40 px-1 py-5 sm:px-4">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
            aria-hidden="true"
          >
            <Compass className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-foreground">
              No strong openings yet.
            </p>
            <p className="mt-1 text-xs leading-relaxed font-medium text-muted-foreground">
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
                        ? "min-w-0 basis-[86%] pl-3"
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

          <div
            role="list"
            className="hidden md:grid md:grid-cols-2 md:gap-5 xl:grid-cols-3"
          >
            {visibleRecommendations.map((recommendation) => (
              <div key={recommendation.id} className="min-w-0">
                <RecommendedGroupCard group={recommendation} />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
