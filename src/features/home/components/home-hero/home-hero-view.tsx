import { useRef } from "react";
import type { HomeHeroViewProps } from "@/features/home/components/home-hero/home-hero.types";
import {
  getCompactHeroCopy,
  getGreeting,
} from "@/features/home/components/home-hero/home-hero-copy";
import { HomeHeroNotificationButton } from "@/features/home/components/home-hero/home-hero-notification-button";
import { HomeHeroCompactHeader } from "@/features/home/components/home-hero/home-hero-sections/home-hero-compact-header";
import { HomeHeroNextMovePanel } from "@/features/home/components/home-hero/home-hero-sections/home-hero-next-move-panel";
import { HomeHeroPrimaryHeader } from "@/features/home/components/home-hero/home-hero-sections/home-hero-primary-header";
import { useHomeCollapsibleHero } from "@/features/home/hooks/use-home-collapsible-hero";
import { buildHomeNextMove } from "@/features/home/lib/home-insights";

export function HomeHeroView({
  autoForgeRequest,
  autoForgeRequestUnavailable,
  compactNotificationButton,
  groups,
  invitations,
  notificationButton,
  plans,
  recommendations,
  stats,
  viewer,
}: HomeHeroViewProps) {
  const { greeting, sub } = getGreeting(viewer.firstName);
  const heroRef = useRef<HTMLElement | null>(null);
  const { isCompactVisible } = useHomeCollapsibleHero({ ref: heroRef });
  const nextMove = buildHomeNextMove({
    autoForgeRequest,
    autoForgeRequestUnavailable,
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
        notificationButton={
          compactNotificationButton ?? <HomeHeroNotificationButton />
        }
        sub={compactCopy.sub}
        title={compactCopy.title}
      />

      <div className="flex w-full flex-col gap-5">
        <HomeHeroPrimaryHeader
          greeting={greeting}
          notificationButton={
            notificationButton ?? <HomeHeroNotificationButton />
          }
          sub={sub}
        />

        <HomeHeroNextMovePanel nextMove={nextMove} />
      </div>
    </section>
  );
}
