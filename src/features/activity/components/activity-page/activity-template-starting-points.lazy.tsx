import { lazy, Suspense } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type ActivityTemplateStartingPointsVariant = "sidebar" | "stage";

const ActivityTemplateStartingPoints = lazy(() =>
  import(
    "@/features/activity/components/activity-page/activity-template-starting-points"
  ).then((module) => ({
    default: module.ActivityTemplateStartingPoints,
  })),
);

const STARTING_POINT_SKELETON_ROW_IDS = [
  "first",
  "second",
  "third",
  "fourth",
] as const;

interface LazyActivityTemplateStartingPointsProps {
  variant: ActivityTemplateStartingPointsVariant;
}

export function LazyActivityTemplateStartingPoints({
  variant,
}: LazyActivityTemplateStartingPointsProps) {
  return (
    <Suspense fallback={<StartingPointsFallback variant={variant} />}>
      <ActivityTemplateStartingPoints variant={variant} />
    </Suspense>
  );
}

function StartingPointsFallback({
  variant,
}: LazyActivityTemplateStartingPointsProps) {
  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        isSidebar
          ? "border-border border-t px-4 py-6 md:hidden"
          : "flex min-h-full flex-1 items-center px-8 py-12",
      )}
      role="status"
    >
      <span className="sr-only">Loading plan ideas</span>
      <div className={cn("w-full", !isSidebar && "mx-auto max-w-2xl")}>
        <Skeleton className="h-3 w-24" tone="teal" />
        <Skeleton className="mt-3 h-6 w-64 max-w-full" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        <div
          className={cn(
            "mt-5 grid gap-x-8",
            isSidebar ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
          )}
        >
          {STARTING_POINT_SKELETON_ROW_IDS.slice(0, isSidebar ? 3 : 4).map(
            (rowId) => (
              <div
                key={rowId}
                aria-hidden="true"
                className="flex items-center gap-3 border-border border-t py-4"
              >
                <Skeleton className="size-7 shrink-0" shape="square" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-32 max-w-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
