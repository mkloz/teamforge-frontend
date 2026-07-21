import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { useState } from "react";

import { forgeRecentActivitiesQueryOptions } from "@/features/forge/api/forge-query-options";
import { hasMatchingRecentActivity } from "@/features/forge/lib/recent-activity/activity-category";
import { buildRecentActivityItems } from "@/features/forge/lib/recent-activity/recent-activity-items";
import { IconTile } from "@/shared/components/ui/icon-tile";

import { RecentActivityCard } from "./recent-activity-card";
import { RecentActivityEmptyState } from "./recent-activity-empty-state";
import { RecentActivityPagination } from "./recent-activity-pagination";
import { RecentActivitySkeleton } from "./recent-activity-skeleton";
import {
  RECENT_ACTIVITIES_PER_PAGE,
  type RecentActivityRowProps,
} from "./types";

export function RecentActivityRow({
  appliedTemplateId,
  selectedActivity,
  onTemplateToggle,
}: RecentActivityRowProps) {
  const [pageState, setPageState] = useState({
    page: 0,
    selectedActivity,
  });
  const { data = [], isLoading } = useQuery(
    forgeRecentActivitiesQueryOptions(),
  );
  const recentActivities = buildRecentActivityItems(data, selectedActivity);
  const pageCount = Math.max(
    1,
    Math.ceil(recentActivities.length / RECENT_ACTIVITIES_PER_PAGE),
  );
  const page =
    pageState.selectedActivity === selectedActivity
      ? Math.min(pageState.page, pageCount - 1)
      : 0;
  const visibleActivities = recentActivities.slice(
    page * RECENT_ACTIVITIES_PER_PAGE,
    page * RECENT_ACTIVITIES_PER_PAGE + RECENT_ACTIVITIES_PER_PAGE,
  );
  const canPage = pageCount > 1;

  function showPreviousActivities() {
    setPageState({
      selectedActivity,
      page: page === 0 ? pageCount - 1 : page - 1,
    });
  }

  function showNextActivities() {
    setPageState({
      selectedActivity,
      page: (page + 1) % pageCount,
    });
  }

  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="flex flex-col gap-2.5"
    >
      <div className="flex items-center justify-between gap-3 px-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <IconTile icon={History} shape="circle" size="sm" tone="neutral" />
          <div className="min-w-0">
            <h3
              id="recent-activity-heading"
              className="font-semibold text-muted-foreground text-xs leading-none"
            >
              Recent activity
            </h3>
            <p className="mt-1 text-muted-foreground/55 text-xs leading-none">
              Use a recent activity as your starting point.
            </p>
          </div>
        </div>

        {canPage && (
          <RecentActivityPagination
            page={page}
            pageCount={pageCount}
            onPrevious={showPreviousActivities}
            onNext={showNextActivities}
          />
        )}
      </div>

      {isLoading ? (
        <RecentActivitySkeleton />
      ) : recentActivities.length === 0 ? (
        <RecentActivityEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visibleActivities.map((activity) => {
            const templateId = `recent:${activity.id}`;

            return (
              <RecentActivityCard
                key={activity.id}
                activity={activity}
                active={appliedTemplateId === templateId}
                recommended={hasMatchingRecentActivity(
                  activity,
                  selectedActivity,
                )}
                onTemplateToggle={onTemplateToggle}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
