import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";

import { planCreationRecentActivitiesQueryOptions } from "@/features/plan-creation/api/plan-creation-query-options";
import { buildRecentActivityItems } from "@/features/plan-creation/lib/recent-activity/recent-activity-items";
import { getRecentActivityTemplateId } from "@/features/plan-creation/lib/recent-activity/recent-activity-template-id";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/components/ui/carousel";

import { RecentActivityCard } from "./recent-activity-card";
import { RecentActivityEmptyState } from "./recent-activity-empty-state";
import { RecentActivityPagination } from "./recent-activity-pagination";
import { RecentActivitySkeleton } from "./recent-activity-skeleton";
import type { RecentActivityRowProps } from "./types";
import { useRecentActivityCarousel } from "./use-recent-activity-carousel";

export function RecentActivityRow({
  appliedTemplateId,
  selectedActivity,
  onTemplateToggle,
}: RecentActivityRowProps) {
  const { data = [], isLoading } = useQuery(
    planCreationRecentActivitiesQueryOptions(),
  );
  const recentActivities = buildRecentActivityItems(data, selectedActivity);
  const carousel = useRecentActivityCarousel({
    itemCount: recentActivities.length,
  });
  const canPage = carousel.pageCount > 1;

  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="flex flex-col gap-2.5"
    >
      <div className="flex items-center justify-between gap-3 px-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <History
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <h3
            id="recent-activity-heading"
            className="font-semibold text-muted-foreground text-xs leading-none"
          >
            Recently used
          </h3>
        </div>

        {canPage && (
          <RecentActivityPagination
            page={carousel.page}
            pageCount={carousel.pageCount}
            onPrevious={() => carousel.api?.scrollPrev()}
            onNext={() => carousel.api?.scrollNext()}
          />
        )}
      </div>

      {isLoading ? (
        <RecentActivitySkeleton />
      ) : recentActivities.length === 0 ? (
        <RecentActivityEmptyState />
      ) : (
        <Carousel
          aria-label="Recently used activities"
          className="min-w-0"
          key={selectedActivity ?? "all-activities"}
          opts={carousel.options}
          setApi={carousel.setApi}
        >
          <CarouselContent className="-ml-2.5 pb-1">
            {recentActivities.map((activity) => {
              const templateId = getRecentActivityTemplateId(activity.id);

              return (
                <CarouselItem
                  className="basis-[86%] pl-2.5 sm:basis-1/3"
                  key={activity.id}
                >
                  <RecentActivityCard
                    activity={activity}
                    active={appliedTemplateId === templateId}
                    onTemplateToggle={onTemplateToggle}
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  );
}
