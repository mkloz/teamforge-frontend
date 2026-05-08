import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck2,
  Compass,
  Flame,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  buildActivityGroupNavigation,
  buildActivityNavigation,
} from "@/features/activity/lib/activity-route";
import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import type { HomeNextMove } from "@/features/home/lib/home-insights";
import { buildHomeNavigation } from "@/features/home/lib/home-route";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/features/onboarding/lib/onboarding-route";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { Button } from "@/shared/components/ui/button";

interface HomeHeroMoveIconProps {
  kind: HomeNextMove["kind"];
  className?: string;
}

const heroActionClassName = "h-11 flex-[1_1_9rem] sm:flex-none";

export function HomeHeroMoveIcon({ kind, className }: HomeHeroMoveIconProps) {
  switch (kind) {
    case "profile":
      return <ShieldCheck className={className} aria-hidden="true" />;
    case "invitation":
      return <Mail className={className} aria-hidden="true" />;
    case "plan":
      return <CalendarCheck2 className={className} aria-hidden="true" />;
    case "recommendation":
      return <Compass className={className} aria-hidden="true" />;
    case "forge":
      return <Flame className={className} aria-hidden="true" />;
  }

  return null;
}

export function PrimaryAction({ move }: { move: HomeNextMove }) {
  if (move.kind === "profile") {
    return <ProfilePrimaryAction move={move} />;
  }

  if (move.kind === "invitation") {
    return (
      <Button asChild variant="primary" className={heroActionClassName}>
        <Link
          {...buildHomeNavigation({
            panel: "invitations",
            invite: move.inviteId,
            view: "received",
          })}
        >
          {move.primaryLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    );
  }

  if (move.kind === "plan") {
    return (
      <Button asChild variant="primary" className={heroActionClassName}>
        <Link
          {...buildActivityGroupNavigation(move.groupId, {
            panel: "group",
            plan: move.planId,
          })}
        >
          {move.primaryLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    );
  }

  if (move.kind === "recommendation") {
    return (
      <Button asChild variant="primary" className={heroActionClassName}>
        <Link {...buildExploreNavigation()}>
          {move.primaryLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild variant="primary" className={heroActionClassName}>
      <Link {...buildForgeLaunchNavigation()}>
        {move.primaryLabel}
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
}

export function SecondaryAction({ move }: { move: HomeNextMove }) {
  if (move.kind === "profile") {
    return (
      <Button asChild variant="outline" className={heroActionClassName}>
        <Link {...buildProfileNavigation()}>{move.secondaryLabel}</Link>
      </Button>
    );
  }

  if (move.kind === "plan") {
    return (
      <Button asChild variant="outline" className={heroActionClassName}>
        <Link {...buildActivityNavigation()}>{move.secondaryLabel}</Link>
      </Button>
    );
  }

  if (move.kind === "recommendation") {
    return (
      <Button asChild variant="outline" className={heroActionClassName}>
        <Link {...buildForgeLaunchNavigation()}>{move.secondaryLabel}</Link>
      </Button>
    );
  }

  if (move.kind === "forge") {
    return (
      <Button asChild variant="outline" className={heroActionClassName}>
        <Link {...buildExploreNavigation()}>{move.secondaryLabel}</Link>
      </Button>
    );
  }

  return (
    <Button asChild variant="outline" className={heroActionClassName}>
      <Link {...buildExploreNavigation()}>{move.secondaryLabel}</Link>
    </Button>
  );
}

function ProfilePrimaryAction({
  move,
}: {
  move: Extract<HomeNextMove, { kind: "profile" }>;
}) {
  if (move.nextStep.kind === "security") {
    return (
      <Button asChild variant="primary" className={heroActionClassName}>
        <Link {...buildSettingsNavigation("security")}>
          {move.primaryLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    );
  }

  if (move.nextStep.kind === "account") {
    return (
      <Button asChild variant="primary" className={heroActionClassName}>
        <Link {...buildSettingsNavigation("account")}>
          {move.primaryLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    );
  }

  if (move.nextStep.kind === "personality") {
    return (
      <Button asChild variant="primary" className={heroActionClassName}>
        <Link {...buildPersonalityEditNavigation({ returnTo: "/home" })}>
          {move.primaryLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild variant="primary" className={heroActionClassName}>
      <Link {...buildInterestsEditNavigation({ returnTo: "/home" })}>
        {move.primaryLabel}
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
}
