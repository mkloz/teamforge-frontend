import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/components/ui/carousel";
import { GroupPlanCard } from "../../explore/components/group-plan-card";
import { useHomeData } from "../hooks/use-home-data";

/**
 * RecommendedGroups section showing personalized group suggestions.
 * Reuses the GroupPlanCard from the Explore feature for consistency.
 * Uses shadcn/ui Carousel for mobile/tablet and a grid for desktop.
 */
export function RecommendedGroups() {
  const { recommendations, isLoading } = useHomeData();

  if (isLoading && recommendations.length === 0) {
    return (
      <div className="w-full flex flex-col gap-5 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded self-center" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 w-full bg-muted rounded-3xl shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="recommended-groups-heading"
      className="w-full flex flex-col gap-5"
    >
      {/* Section header */}
      <div className="flex flex-col gap-0.5 items-center text-center">
        <h2
          id="recommended-groups-heading"
          className="text-base font-black tracking-tight text-foreground"
        >
          Groups You Might Like
        </h2>
      </div>

      {/* Mobile/Tablet Carousel */}
      <div className="md:hidden w-full overflow-hidden">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {recommendations.map((recommendation) => (
              <CarouselItem key={recommendation.id} className="pl-4 basis-70">
                <div className="flex justify-center w-full">
                  <GroupPlanCard
                    group={recommendation}
                    matchScore={recommendation.matchScore}
                    distance={recommendation.distance}
                    variant="compact"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Desktop Grid */}
      <div
        role="list"
        className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {recommendations.slice(0, 3).map((recommendation) => (
          <div key={recommendation.id} className="w-full flex justify-center">
            <GroupPlanCard
              group={recommendation}
              matchScore={recommendation.matchScore}
              distance={recommendation.distance}
              variant="compact"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
