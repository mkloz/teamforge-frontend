import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";
import { FormationOpeningCard } from "@/shared/components/formation-opening-card";
import { Button } from "@/shared/components/ui/button";
import type { ExploreFeedItem } from "@/shared/schemas";
import { ExploreGroupPlanCard } from "./explore-group-plan-card";

interface ExploreFeedContentProps {
  items: ExploreFeedItem[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  totalItems: number;
}

export function ExploreFeedContent({
  items,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  totalItems,
}: ExploreFeedContentProps) {
  const featuredItem = items[0] ?? null;
  const remainingItems = items.slice(1);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {featuredItem ? (
        <section className="flex flex-col gap-2.5">
          <FeedSectionLabel
            title="Best opening right now"
            detail={`${totalItems} ${totalItems === 1 ? "opening" : "openings"} available`}
          />
          <ExploreFeedItemCard item={featuredItem} imagePriority="high" />
        </section>
      ) : null}

      {remainingItems.length > 0 ? (
        <section className="flex flex-col gap-2.5">
          <FeedSectionLabel
            title="More openings"
            detail={`${remainingItems.length} shown`}
          />
          {remainingItems.map((item) => (
            <ExploreFeedItemCard
              key={getExploreFeedItemKey(item)}
              item={item}
            />
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
      <h2 className="font-semibold text-muted-foreground text-sm">{title}</h2>
      <span className="shrink-0 font-bold text-muted-foreground text-sm">
        {detail}
      </span>
    </div>
  );
}

function ExploreFeedItemCard({
  imagePriority,
  item,
}: {
  imagePriority?: "auto" | "high";
  item: ExploreFeedItem;
}) {
  return (
    <div>
      {item.type === "GROUP" ? (
        <ExploreGroupPlanCard
          group={item.group}
          imagePriority={imagePriority}
        />
      ) : (
        <FormationOpeningCard opening={item.opening} />
      )}
    </div>
  );
}

function getExploreFeedItemKey(item: ExploreFeedItem) {
  return item.type === "GROUP"
    ? `group-${item.group.id}`
    : `opening-${item.opening.id}`;
}
