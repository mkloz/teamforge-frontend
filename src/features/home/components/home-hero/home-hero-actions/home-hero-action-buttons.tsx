import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactElement } from "react";
import type { HomeNextMove } from "@/features/home/lib/home-insights";
import { Button } from "@/shared/components/ui/button";
import {
  buildActivityGroupNavigation,
  buildExploreNavigation,
  buildForgeLaunchNavigation,
  buildGroupPlanDetailNavigation,
  buildHomeNavigation,
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
  buildProfileNavigation,
  buildSettingsNavigation,
} from "@/shared/navigation";

const heroActionClassName = "h-11 flex-[1_1_9rem] sm:flex-none";

type HomeMoveKind = HomeNextMove["kind"];
type HomeMoveByKind<Kind extends HomeMoveKind> = Extract<
  HomeNextMove,
  { kind: Kind }
>;
type HeroActionRenderer = (move: HomeNextMove) => ReactElement;
type HeroActionRenderers = Record<HomeMoveKind, HeroActionRenderer>;

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
