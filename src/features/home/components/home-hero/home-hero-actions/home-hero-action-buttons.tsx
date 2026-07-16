import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactElement } from "react";
import {
  clearAutoForgeRequestWizardDraft,
  saveAutoForgeRequestAsWizardDraft,
} from "@/features/forge/public/auto-forge-request";
import type { HomeNextMove } from "@/features/home/lib/home-insights";
import { Button } from "@/shared/components/ui/button";
import {
  buildActivityGroupNavigation,
  buildExploreNavigation,
  buildForgeLaunchNavigation,
  buildForgeNavigation,
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
  "auto-request-unavailable": (move) => {
    const requestMove = getHomeMoveByKind(move, "auto-request-unavailable");

    return (
      <Button asChild variant="primary" className={heroActionClassName}>
        <a href="#forge-request-heading">{requestMove.primaryLabel}</a>
      </Button>
    );
  },
  "auto-request": (move) => {
    const requestMove = getHomeMoveByKind(move, "auto-request");
    const canEdit =
      requestMove.request.lifecycle === "DRAFT" ||
      requestMove.request.lifecycle === "SEARCHING" ||
      (requestMove.request.lifecycle === "PAUSED" &&
        requestMove.request.pauseReason === "USER");

    if (requestMove.startsNewRequest) {
      return (
        <Button asChild variant="primary" className={heroActionClassName}>
          <Link
            {...buildForgeLaunchNavigation()}
            onClick={() =>
              clearAutoForgeRequestWizardDraft(requestMove.request.id)
            }
          >
            {requestMove.primaryLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      );
    }

    if (canEdit) {
      return (
        <Button asChild variant="primary" className={heroActionClassName}>
          <Link
            {...buildForgeNavigation({
              open: true,
              step: 3,
              mode: "auto",
              activityId: requestMove.request.activity.id,
              requestId: requestMove.request.id,
            })}
            onClick={() =>
              saveAutoForgeRequestAsWizardDraft(requestMove.request)
            }
          >
            {requestMove.primaryLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      );
    }

    return (
      <Button asChild variant="primary" className={heroActionClassName}>
        <a href="#forge-request-heading">{requestMove.primaryLabel}</a>
      </Button>
    );
  },
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
  "auto-request-unavailable": (move) => {
    const requestMove = getHomeMoveByKind(move, "auto-request-unavailable");

    return (
      <Button asChild variant="outline" className={heroActionClassName}>
        <Link {...buildExploreNavigation()}>{requestMove.secondaryLabel}</Link>
      </Button>
    );
  },
  "auto-request": (move) => {
    const requestMove = getHomeMoveByKind(move, "auto-request");

    return (
      <Button asChild variant="outline" className={heroActionClassName}>
        <a href="#forge-request-heading">{requestMove.secondaryLabel}</a>
      </Button>
    );
  },
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
