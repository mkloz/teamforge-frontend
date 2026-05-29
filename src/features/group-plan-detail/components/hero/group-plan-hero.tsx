import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  getHeroCoverImage,
  HeroCover,
} from "@/features/group-plan-detail/components/hero/hero-cover";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  formatCost,
  formatLocation,
  formatPlanDateTime,
  getSeatsLabel,
} from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import {
  type GroupPlanDetailRouteSearch,
  getGroupPlanDetailBackLink,
} from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { Image } from "@/shared/components/common/image";
import { Button } from "@/shared/components/ui/button";
import { scrollWindowToTop } from "@/shared/lib/scroll-to-top";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";
import { cn } from "@/shared/lib/utils";

interface GroupPlanHeroProps {
  detail: GroupPlanDetail;
  isCompactVisible: boolean;
  search: GroupPlanDetailRouteSearch;
}

export function GroupPlanHero({
  detail,
  isCompactVisible,
  search,
}: GroupPlanHeroProps) {
  const planTitle = detail.plan?.title ?? detail.activity.title;
  const planTime = formatPlanDateTime(detail.plan?.dateTime);
  const location = formatLocation(detail);
  const cost = detail.plan ? formatCost(detail.plan) : null;
  const seats = getSeatsLabel(detail);
  const backLink = getGroupPlanDetailBackLink(detail.group.id, search);

  const metadata = [
    planTime.full !== "Date TBD" ? planTime.full : "Date TBD",
    location,
    cost && cost !== "Cost TBD" ? cost : null,
    seats,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="flex flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="px-0">
        <Link {...backLink.navigation}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {backLink.label}
        </Link>
      </Button>

      <HeroCover detail={detail} alt={`${planTitle} cover photo`}>
        <h1 className="mt-4 max-w-3xl text-balance font-black text-3xl text-foreground leading-none tracking-tight md:text-4xl lg:text-5xl">
          {planTitle}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="font-bold text-foreground/85 text-sm md:text-base">
            {metadata}
          </p>
        </div>

        {detail.group.name !== detail.activity.title ? (
          <p className="mt-2 font-medium text-foreground/70 text-sm">
            {detail.group.name} · gathering around {detail.activity.title}
          </p>
        ) : null}
      </HeroCover>

      <GroupPlanCompactHero
        detail={detail}
        metadata={metadata}
        title={planTitle}
        visible={isCompactVisible}
      />
    </header>
  );
}

function GroupPlanCompactHero({
  detail,
  metadata,
  title,
  visible,
}: {
  detail: GroupPlanDetail;
  metadata: string;
  title: string;
  visible: boolean;
}) {
  const imageSrc = getHeroCoverImage(detail);
  const compactImageSrc = imageSrc ? getSizedImageUrl(imageSrc, 640) : null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed top-0 right-0 left-0 z-40 text-white md:left-14",
        "transform-[translate3d(0,var(--group-detail-compact-y,-8px),0)] opacity-(--group-detail-compact-opacity) transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
      )}
      aria-hidden={!visible}
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-5 lg:px-8">
        <div
          className={cn(
            "relative h-(--group-detail-cover-collapsed-height,72px) overflow-hidden rounded-b-md bg-canvas shadow-[0_18px_44px_rgb(0_0_0/80%)]",
            visible ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          {visible && imageSrc ? (
            <Image
              src={compactImageSrc ?? imageSrc}
              alt=""
              loading="lazy"
              wrapperClassName="absolute inset-0"
              className="size-full object-cover"
              noImageComponent={null}
              fallbackComponent={null}
              showNoImage={false}
            />
          ) : null}

          <div
            className="absolute inset-0 bg-linear-to-r from-black/92 via-black/76 to-black/52"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/70 via-black/35 to-transparent"
            aria-hidden="true"
          />

          <button
            type="button"
            aria-label="Scroll group details to top"
            tabIndex={visible ? 0 : -1}
            onClick={scrollWindowToTop}
            className="absolute inset-0 z-10 rounded-b-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          />

          <div className="pointer-events-none relative z-20 flex size-full items-center gap-3 px-4 sm:px-5 lg:px-6">
            <div className="min-w-0 flex-1">
              <p className="truncate font-black text-base leading-tight tracking-tight [text-shadow:0_2px_12px_rgb(0_0_0/80%)] sm:text-lg">
                {title}
              </p>
              <p className="mt-0.5 truncate font-semibold text-white/90 text-xs leading-tight [text-shadow:0_1px_8px_rgb(0_0_0/85%)] sm:text-sm">
                {metadata}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
