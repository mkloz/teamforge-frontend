import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CalendarCheck2, History } from "lucide-react";

import { ProfileApi } from "@/features/profile/api/profile.api";
import type { PersonalActivityHistoryItem } from "@/features/profile/schemas/personal-activity-history.schema";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { buildActivityGroupHubNavigation } from "@/shared/navigation/activity-navigation";

export function PersonalActivityHistorySection() {
  const query = useInfiniteQuery({
    queryKey: APP_QUERY_KEYS.profile.activityHistory,
    queryFn: ({ pageParam }) => ProfileApi.getMyActivityHistory(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    staleTime: 30_000,
  });
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section aria-labelledby="private-activity-history-heading">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
          <History aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2
            id="private-activity-history-heading"
            className="font-bold text-ink text-xl"
          >
            Activity history
          </h2>
          <p className="mt-1 text-slate-muted text-sm">
            Completed plans, visible only to you.
          </p>
        </div>
      </div>

      {query.isPending ? (
        <p
          className="rounded-2xl bg-card px-4 py-5 text-slate-muted text-sm"
          aria-busy="true"
        >
          Loading your past activities…
        </p>
      ) : query.isError ? (
        <div className="rounded-2xl bg-card px-4 py-5">
          <p className="text-sm">We couldn’t load your activity history.</p>
          <Button
            className="mt-3"
            size="sm"
            variant="outline"
            onClick={() => void query.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title="No completed activities yet"
          description="They'll appear here once attendance is recorded."
        />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <HistoryRow item={item} key={item.id} />
          ))}
          {query.hasNextPage ? (
            <Button
              className="justify-self-start"
              disabled={query.isFetchingNextPage}
              loading={query.isFetchingNextPage}
              variant="outline"
              onClick={() => void query.fetchNextPage()}
            >
              Show earlier activities
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}

function HistoryRow({ item }: { item: PersonalActivityHistoryItem }) {
  const navigation = item.groupId
    ? buildActivityGroupHubNavigation(item.groupId)
    : null;
  const attendance = formatAttendance(item);

  return (
    <article className="flex min-w-0 items-start gap-3 rounded-2xl bg-card px-4 py-4 sm:px-5">
      <CalendarCheck2
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-primary"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-ink">
          {item.activityTitle}
        </h3>
        <p className="mt-0.5 truncate text-slate-muted text-sm">
          {item.groupName} · {item.planTitle}
        </p>
        <p className="mt-2 text-slate-muted text-xs">
          {new Date(item.completedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
          {` · ${attendance}`}
          {item.participantScope === "GUEST" ? " · Joined as a plan guest" : ""}
        </p>
      </div>
      {navigation ? (
        <Button asChild size="sm" variant="ghost">
          <Link {...navigation}>
            {item.repeatSourcePlanId ? "Open to repeat" : "Open"}
          </Link>
        </Button>
      ) : null}
    </article>
  );
}

function formatAttendance(item: PersonalActivityHistoryItem) {
  if (item.attendance === "ATTENDED") {
    return item.verificationState === "CORRECTED"
      ? "Attended · corrected"
      : "Attended";
  }
  if (item.attendance === "DID_NOT_ATTEND") return "Didn’t attend";
  return "Attendance not recorded";
}
