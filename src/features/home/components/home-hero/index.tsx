import { type ReactNode, useRef } from "react";

import { HomeHeroSkeleton } from "@/features/home/components/home-skeletons";
import { useHomeCollapsibleHero } from "@/features/home/hooks/use-home-collapsible-hero";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { useHomeViewerState } from "@/features/home/hooks/use-home-viewer";
import type {
  HomeViewer,
  PlannedGroup,
  UserStats,
} from "@/features/home/lib/home-contract";
import { buildHomeNextMove } from "@/features/home/lib/home-insights";
import { scrollWindowToTop } from "@/shared/lib/scroll-to-top";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup, GroupApi, Invite } from "@/shared/schemas";
import {
  HomeHeroMoveIcon,
  PrimaryAction,
  SecondaryAction,
} from "./home-hero-actions";
import { getCompactHeroCopy, getGreeting } from "./home-hero-copy";
import { HomeHeroNotificationButton } from "./home-hero-notification-button";
import { HomeHeroQuickActions } from "./home-hero-quick-actions";
import { HomeHeroSignalMap } from "./home-hero-signal-map";

export function HomeHero() {
  const { viewer, isLoading: viewerLoading } = useHomeViewerState();
  const homeData = useHomeData();
  const { stats, invitations, plans, groups, recommendations } = homeData;
  const isHeroDataLoading =
    homeData.isStatsLoading ||
    homeData.isInvitationsLoading ||
    homeData.isPlansLoading ||
    homeData.isGroupsLoading ||
    homeData.isRecommendationsLoading;

  if (viewerLoading || isHeroDataLoading) {
    return <HomeHeroSkeleton />;
  }

  return (
    <HomeHeroView
      groups={groups}
      invitations={invitations}
      plans={plans}
      recommendations={recommendations}
      stats={stats}
      viewer={viewer}
    />
  );
}

interface HomeHeroViewProps {
  compactNotificationButton?: ReactNode;
  groups: GroupApi[];
  invitations: Invite[];
  notificationButton?: ReactNode;
  plans: PlannedGroup[];
  recommendations: ExploreGroup[];
  stats: UserStats;
  viewer: HomeViewer;
}

export function HomeHeroView({
  compactNotificationButton = <HomeHeroNotificationButton />,
  groups,
  invitations,
  notificationButton = <HomeHeroNotificationButton />,
  plans,
  recommendations,
  stats,
  viewer,
}: HomeHeroViewProps) {
  const { greeting, sub } = getGreeting(viewer.firstName);
  const heroRef = useRef<HTMLElement | null>(null);
  const { isCompactVisible } = useHomeCollapsibleHero({ ref: heroRef });
  const nextMove = buildHomeNextMove({
    viewer,
    stats,
    invitations,
    plans,
    groups,
    recommendations,
  });
  const compactCopy = getCompactHeroCopy(nextMove);

  return (
    <section
      ref={heroRef}
      aria-labelledby="home-hero-heading"
      className="w-full [--home-compact-opacity:0] [--home-compact-y:-10px] [--home-hero-original-delay:0ms] [--home-hero-original-opacity:1] [--home-hero-original-y:0px]"
    >
      <HomeHeroCompactHeader
        isVisible={isCompactVisible}
        notificationButton={compactNotificationButton}
        sub={compactCopy.sub}
        title={compactCopy.title}
      />

      <div className="flex w-full flex-col gap-5">
        <div className="transform-[translate3d(0,var(--home-hero-original-y,0px),0)] flex items-start justify-between gap-3 opacity-(--home-hero-original-opacity,1) transition-[opacity,transform] duration-300 ease-out [transition-delay:var(--home-hero-original-delay,0ms)] motion-reduce:transition-none">
          <div className="min-w-0 flex-1">
            <h1
              id="home-hero-heading"
              className="font-black text-foreground text-xl leading-tight tracking-tight sm:text-2xl md:text-3xl lg:text-4xl"
            >
              {greeting}
            </h1>
            <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed md:text-base">
              {sub}
            </p>
          </div>

          {notificationButton}
        </div>

        <div className="relative grid gap-4 overflow-hidden rounded-xl px-4 py-4 sm:gap-6 sm:px-5 sm:py-5 lg:px-6 2xl:min-h-80 2xl:grid-cols-[minmax(0,1fr)_minmax(17rem,20rem)] 2xl:items-center 2xl:gap-10">
          <div className="absolute inset-y-0 left-0 w-full [background:linear-gradient(112deg,color-mix(in_srgb,var(--color-forge-teal)_13%,transparent),color-mix(in_srgb,var(--color-forge-teal)_4%,transparent)_48%,transparent_76%)]" />
          <div className="absolute inset-y-5 left-2 w-px rounded-full bg-forge-teal/55 sm:inset-y-6 sm:left-3" />

          <div className="relative z-10 flex min-w-0 flex-col gap-4 pl-2 sm:gap-5 sm:pl-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-forge-teal/20 bg-forge-teal/10 text-forge-teal shadow-sm sm:size-12 md:size-14">
                <HomeHeroMoveIcon
                  kind={nextMove.kind}
                  className="size-5 sm:size-5.5 md:size-6"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-black text-forge-teal text-xs">
                  {nextMove.eyebrow}
                </p>
                <h2 className="mt-1 max-w-3xl font-black text-foreground text-lg leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                  {nextMove.title}
                </h2>
              </div>
            </div>

            <p className="max-w-xl font-medium text-muted-foreground text-xs leading-relaxed lg:text-base">
              {nextMove.body}
            </p>

            <div className="flex flex-row flex-wrap gap-2 sm:gap-3">
              <PrimaryAction move={nextMove} />
              <SecondaryAction move={nextMove} />
            </div>

            <HomeHeroQuickActions signal={nextMove.signal} />
          </div>

          <HomeHeroSignalMap />
        </div>
      </div>
    </section>
  );
}

function HomeHeroCompactHeader({
  isVisible,
  notificationButton,
  sub,
  title,
}: {
  isVisible: boolean;
  notificationButton: ReactNode;
  sub: string;
  title: string;
}) {
  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        "pointer-events-none fixed top-0 right-0 left-0 z-40 md:left-14",
        "transform-[translate3d(0,var(--home-compact-y,-10px),0)] opacity-(--home-compact-opacity) transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
      )}
    >
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-12 lg:px-8 xl:gap-14">
        <div
          className={cn(
            "relative flex h-16 min-w-0 items-center justify-between gap-3 overflow-hidden rounded-b-xl border-border/65 border-b bg-canvas/95 px-4 shadow-sm backdrop-blur sm:h-18 sm:px-5",
            isVisible ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <button
            type="button"
            aria-label="Scroll home to top"
            tabIndex={isVisible ? 0 : -1}
            onClick={scrollWindowToTop}
            className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-inset"
          />

          <div className="pointer-events-none relative z-10 min-w-0">
            <p className="truncate font-black text-base text-foreground leading-tight tracking-tight sm:text-lg">
              {title}
            </p>
            <p className="mt-0.5 truncate font-medium text-muted-foreground text-xs leading-tight sm:text-sm">
              {sub}
            </p>
          </div>

          <div className="relative z-10 shrink-0">{notificationButton}</div>
        </div>
      </div>
    </div>
  );
}
