import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/components/ui/carousel";

import { RecommendedGroupCard } from "@/features/home/components/recommended-group-card";
import { useHomeData } from "@/features/home/hooks/use-home-data";

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
      <div className="flex flex-col gap-0.5 items-center text-center">
        <h2
          id="recommended-groups-heading"
          className="text-base font-black tracking-tight text-foreground"
        >
          Groups You Might Like
        </h2>
      </div>

      {recommendations.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 px-5 py-10 text-center">
          <p className="text-sm font-bold text-foreground">
            No recommendations yet
          </p>
          <p className="mt-1 text-xs font-medium text-slate-muted">
            Once more groups match your profile, they will show up here.
          </p>
        </div>
      ) : (
        <>
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
                  <CarouselItem
                    key={recommendation.id}
                    className="pl-4 basis-70"
                  >
                    <div className="flex justify-center w-full">
                      <RecommendedGroupCard
                        group={recommendation}
                        variant="compact"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          <div
            role="list"
            className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {recommendations.slice(0, 3).map((recommendation) => (
              <div
                key={recommendation.id}
                className="w-full flex justify-center"
              >
                <RecommendedGroupCard
                  group={recommendation}
                  variant="compact"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
