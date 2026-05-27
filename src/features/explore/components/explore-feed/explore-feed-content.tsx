import { Loader2, RefreshCw } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import type { ExploreGroup } from "@/shared/schemas";
import { ExploreGroupPlanCard } from "./explore-group-plan-card";

interface ExploreFeedContentProps {
  groups: ExploreGroup[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  totalGroups: number;
}

export function ExploreFeedContent({
  groups,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  totalGroups,
}: ExploreFeedContentProps) {
  const featuredGroup = groups[0] ?? null;
  const remainingGroups = groups.slice(1);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {featuredGroup ? (
        <section className="flex flex-col gap-2.5">
          <FeedSectionLabel
            title="Best opening right now"
            detail={`${totalGroups} ${totalGroups === 1 ? "group" : "groups"} available`}
          />
          <ExploreGroupItem>
            <ExploreGroupPlanCard group={featuredGroup} />
          </ExploreGroupItem>
        </section>
      ) : null}

      {remainingGroups.length > 0 ? (
        <section className="flex flex-col gap-2.5">
          <FeedSectionLabel
            title="More openings"
            detail={`${remainingGroups.length} shown`}
          />
          {remainingGroups.map((group) => (
            <ExploreGroupItem key={group.id}>
              <ExploreGroupPlanCard group={group} />
            </ExploreGroupItem>
          ))}
        </section>
      ) : null}

      <ExploreInfiniteScrollSentinel
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={onLoadMore}
      />
    </div>
  );
}

function ExploreInfiniteScrollSentinel({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (
      !sentinel ||
      !hasNextPage ||
      isFetchingNextPage ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "640px 0px 640px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (!hasNextPage) {
    return null;
  }

  return (
    <div ref={sentinelRef} className="flex justify-center py-2">
      <Button
        type="button"
        variant="subtle"
        size="xs"
        onClick={onLoadMore}
        disabled={isFetchingNextPage}
        className="disabled:cursor-wait disabled:opacity-70"
      >
        {isFetchingNextPage ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <RefreshCw className="size-3.5" aria-hidden="true" />
        )}
        {isFetchingNextPage ? "Loading more..." : "Load more"}
      </Button>
    </div>
  );
}

function FeedSectionLabel({
  detail,
  title,
}: {
  detail: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-1 max-compact:flex-col max-compact:items-start max-compact:gap-1">
      <p className="font-semibold text-muted-foreground text-sm">{title}</p>
      <span className="shrink-0 font-bold text-muted-foreground/70 text-sm">
        {detail}
      </span>
    </div>
  );
}

function ExploreGroupItem({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
