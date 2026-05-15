import type { ReactNode } from "react";

import { useHomeData } from "@/features/home/hooks/use-home-data";
import { useHomeViewerState } from "@/features/home/hooks/use-home-viewer";
import type {
  HomeViewer,
  PlannedGroup,
  UserStats,
} from "@/features/home/lib/home-contract";
import { buildHomeNextMove } from "@/features/home/lib/home-insights";
import type { ExploreGroup, GroupApi, Invite } from "@/shared/schemas";
import {
  HomeHeroMoveIcon,
  PrimaryAction,
  SecondaryAction,
} from "./home-hero-actions";
import { getGreeting } from "./home-hero-copy";
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
    return null;
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
  groups: GroupApi[];
  invitations: Invite[];
  notificationButton?: ReactNode;
  plans: PlannedGroup[];
  recommendations: ExploreGroup[];
  stats: UserStats;
  viewer: HomeViewer;
}

export function HomeHeroView({
  groups,
  invitations,
  notificationButton = <HomeHeroNotificationButton />,
  plans,
  recommendations,
  stats,
  viewer,
}: HomeHeroViewProps) {
  const { greeting, sub } = getGreeting(viewer.firstName);
  const nextMove = buildHomeNextMove({
    viewer,
    stats,
    invitations,
    plans,
    groups,
    recommendations,
  });

  return (
    <section aria-labelledby="home-hero-heading" className="w-full">
      <div className="flex w-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
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
