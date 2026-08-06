import { RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";
import { FormationOpeningReportAction } from "@/features/reporting/public/reporting";
import { FormationOpeningCard } from "@/shared/components/formation-opening-card";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import type { ExploreFeedItem } from "@/shared/schemas";
import { ExploreGroupPlanCard } from "./explore-group-plan-card";
import { IntroductoryExploreGroupCard } from "./introductory-explore-group-card";

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
  return (
    <div className="flex flex-col gap-5">
      <section>
        <FeedSectionLabel
          isIntroductory={items.some(
            (item) => item.type === "INTRODUCTORY_GROUP",
          )}
          title="Open plans"
          detail={`${totalItems} ${totalItems === 1 ? "opening" : "openings"}`}
        />

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
          {items.map((item, index) => (
            <div
              key={getExploreFeedItemKey(item)}
              className={getExploreGridSlotClassName(index)}
            >
              <ExploreFeedItemCard
                item={item}
                emphasis={index === 0 ? "lead" : "standard"}
                imagePriority={index === 0 ? "high" : "auto"}
              />
            </div>
          ))}
        </div>
      </section>

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
          <Spinner className="size-3.5" aria-hidden="true" />
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
  isIntroductory,
  title,
}: {
  detail: string;
  isIntroductory: boolean;
  title: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="font-black text-2xl text-foreground tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 font-medium text-muted-foreground text-sm">
          {isIntroductory
            ? "A preview based on the interests you have already shared."
            : "Ranked for your profile, with the strongest fit first."}
        </p>
      </div>
      <span className="shrink-0 pb-0.5 font-bold text-muted-foreground text-xs sm:text-sm">
        {detail}
      </span>
    </div>
  );
}

function ExploreFeedItemCard({
  emphasis,
  imagePriority,
  item,
}: {
  emphasis: "lead" | "standard";
  imagePriority?: "auto" | "high";
  item: ExploreFeedItem;
}) {
  return (
    <div className="size-full">
      {item.type === "GROUP" ? (
        <ExploreGroupPlanCard
          group={item.group}
          emphasis={emphasis}
          imagePriority={imagePriority}
          variant="discovery"
        />
      ) : item.type === "INTRODUCTORY_GROUP" ? (
        <IntroductoryExploreGroupCard
          group={item.group}
          emphasis={emphasis}
          imagePriority={imagePriority}
        />
      ) : (
        <FormationOpeningCard
          opening={item.opening}
          variant="compact"
          safetyAction={
            <FormationOpeningReportAction
              activityId={item.opening.activity.id}
              activityTitle={item.opening.activity.title}
            />
          }
        />
      )}
    </div>
  );
}

function getExploreGridSlotClassName(index: number) {
  const slot = index % 8;

  switch (slot) {
    case 0:
      return "h-[29rem] md:col-span-7";
    case 1:
      return "h-[29rem] md:col-span-5";
    case 2:
      return "h-[24rem] md:col-span-4";
    case 3:
      return "h-[24rem] md:col-span-4";
    case 4:
      return "h-[24rem] md:col-span-4";
    case 5:
      return "h-[27rem] md:col-span-5";
    case 6:
      return "h-[27rem] md:col-span-7";
    default:
      return "h-[24rem] md:col-span-12";
  }
}

function getExploreFeedItemKey(item: ExploreFeedItem) {
  return item.type === "GROUP" || item.type === "INTRODUCTORY_GROUP"
    ? `group-${item.group.id}`
    : `opening-${item.opening.id}`;
}
