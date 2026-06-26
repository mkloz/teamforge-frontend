import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck2,
  Compass,
  Flame,
  type LucideIcon,
  Mail,
  ShieldCheck,
} from "lucide-react";
import type { ReactElement } from "react";

import { buildActivityGroupNavigation } from "@/features/activity/lib/activity-route";
import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { buildGroupPlanDetailNavigation } from "@/features/group-plan-detail/lib/group-plan-detail-route";
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

type HomeMoveKind = HomeNextMove["kind"];
type HomeMoveByKind<Kind extends HomeMoveKind> = Extract<
  HomeNextMove,
  { kind: Kind }
>;
type HeroActionRenderer = (move: HomeNextMove) => ReactElement;
type HeroActionRenderers = Record<HomeMoveKind, HeroActionRenderer>;

const HOME_HERO_MOVE_ICONS: Record<HomeMoveKind, LucideIcon> = {
  forge: Flame,
  invitation: Mail,
  plan: CalendarCheck2,
  profile: ShieldCheck,
  recommendation: Compass,
};

const PRIMARY_ACTION_RENDERERS = {
  profile: (move) => (
    <ProfilePrimaryAction move={getHomeMoveByKind(move, "profile")} />
  ),
  invitation: (move) => {
    const invitationMove = getHomeMoveByKind(move, "invitation");

    return (
      <Button asChild variant="primary" className={heroActionClassName}>
        <Link
          {...buildHomeNavigation({
            panel: "invitations",
            invite: invitationMove.inviteId,
            view: "received",
          })}
        >
          {invitationMove.primaryLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    );
  },
  plan: (move) => {
    const planMove = getHomeMoveByKind(move, "plan");

    return (
      <Button asChild variant="primary" className={heroActionClassName}>
        <Link
          {...buildGroupPlanDetailNavigation(planMove.groupId, {
            source: "home",
            plan: planMove.planId,
          })}
        >
          {planMove.primaryLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    );
  },
  recommendation: (move) => {
    const recommendationMove = getHomeMoveByKind(move, "recommendation");

    return (
      <Button asChild variant="primary" className={heroActionClassName}>
        <Link
          {...buildGroupPlanDetailNavigation(recommendationMove.groupId, {
            source: "home",
          })}
        >
          {recommendationMove.primaryLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    );
  },
  forge: (move) => (
    <Button asChild variant="primary" className={heroActionClassName}>
      <Link {...buildForgeLaunchNavigation()}>
        {move.primaryLabel}
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  ),
} satisfies HeroActionRenderers;

const SECONDARY_ACTION_RENDERERS = {
  profile: (move) => {
    const profileMove = getHomeMoveByKind(move, "profile");

    return (
      <Button asChild variant="outline" className={heroActionClassName}>
        <Link {...buildProfileNavigation()}>{profileMove.secondaryLabel}</Link>
      </Button>
    );
  },
  invitation: (move) => {
    const invitationMove = getHomeMoveByKind(move, "invitation");

    return (
      <Button asChild variant="outline" className={heroActionClassName}>
        <Link {...buildExploreNavigation()}>
          {invitationMove.secondaryLabel}
        </Link>
      </Button>
    );
  },
  plan: (move) => {
    const planMove = getHomeMoveByKind(move, "plan");

    return (
      <Button asChild variant="outline" className={heroActionClassName}>
        <Link {...buildActivityGroupNavigation(planMove.groupId)}>
          {planMove.secondaryLabel}
        </Link>
      </Button>
    );
  },
  recommendation: (move) => {
    const recommendationMove = getHomeMoveByKind(move, "recommendation");

    return (
      <Button asChild variant="outline" className={heroActionClassName}>
        <Link {...buildForgeLaunchNavigation()}>
          {recommendationMove.secondaryLabel}
        </Link>
      </Button>
    );
  },
  forge: (move) => {
    const forgeMove = getHomeMoveByKind(move, "forge");

    return (
      <Button asChild variant="outline" className={heroActionClassName}>
        <Link {...buildExploreNavigation()}>{forgeMove.secondaryLabel}</Link>
      </Button>
    );
  },
} satisfies HeroActionRenderers;

export function HomeHeroMoveIcon({ kind, className }: HomeHeroMoveIconProps) {
  const Icon = HOME_HERO_MOVE_ICONS[kind];

  return <Icon className={className} aria-hidden="true" />;
}

export function PrimaryAction({ move }: { move: HomeNextMove }) {
  return renderHomeMoveAction(PRIMARY_ACTION_RENDERERS, move);
}

export function SecondaryAction({ move }: { move: HomeNextMove }) {
  return renderHomeMoveAction(SECONDARY_ACTION_RENDERERS, move);
}

function renderHomeMoveAction(
  renderers: HeroActionRenderers,
  move: HomeNextMove,
) {
  return renderers[move.kind](move);
}

function getHomeMoveByKind<Kind extends HomeMoveKind>(
  move: HomeNextMove,
  kind: Kind,
): HomeMoveByKind<Kind> {
  if (isHomeMoveKind(move, kind)) {
    return move;
  }

  throw new Error(`Unexpected home move kind: ${move.kind}`);
}

function isHomeMoveKind<Kind extends HomeMoveKind>(
  move: HomeNextMove,
  kind: Kind,
): move is HomeMoveByKind<Kind> {
  return move.kind === kind;
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
