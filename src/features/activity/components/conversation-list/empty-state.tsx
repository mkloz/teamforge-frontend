import { Link } from "@tanstack/react-router";
import { domMax, LazyMotion, m, useReducedMotion } from "framer-motion";
import { UsersRound } from "lucide-react";
import { EmptyConversationsVisual } from "@/features/activity/assets/empty-conversations";
import { EmptyConversationsFilteredVisual } from "@/features/activity/assets/empty-conversations-filtered";
import { Button } from "@/shared/components/ui/button";
import {
  buildExploreNavigation,
  buildPlanCreationLaunchNavigation,
} from "@/shared/navigation";

type ConversationEmptyArtwork = "default" | "filtered";

const emptyDescriptionByCtaState = {
  "false:false": null,
  "false:true": "Start a plan to open your first conversation.",
  "true:false": "Browse open groups and join a conversation.",
  "true:true": "Browse open groups or start a plan of your own.",
} as const;

interface EmptyStateProps {
  label: string;
  description?: string | null;
  artwork?: ConversationEmptyArtwork;
  /** Shows the PlanCreation action for the base empty state. */
  showPlanCreationCta?: boolean;
  showExploreCta?: boolean;
}

export function EmptyState({
  label,
  description: descriptionProp,
  artwork = "default",
  showPlanCreationCta = false,
  showExploreCta = false,
}: EmptyStateProps) {
  const shouldReduceMotion = useReducedMotion();
  const description =
    descriptionProp ??
    getEmptyStateDescription({ showExploreCta, showPlanCreationCta });

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-6 py-12 text-center">
      <EmptyStateArtwork artwork={artwork} />

      <div className="mt-5 max-w-52">
        <p className="font-black text-base text-foreground leading-tight">
          {label}
        </p>
        {description ? (
          <p className="mt-2 font-medium text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>

      <EmptyStateActions
        shouldReduceMotion={shouldReduceMotion}
        showExploreCta={showExploreCta}
        showPlanCreationCta={showPlanCreationCta}
      />
    </div>
  );
}

function EmptyStateArtwork({ artwork }: { artwork: ConversationEmptyArtwork }) {
  if (artwork === "filtered") {
    return (
      <EmptyConversationsFilteredVisual className="mx-auto h-36 w-auto text-foreground" />
    );
  }

  return (
    <EmptyConversationsVisual className="mx-auto h-36 w-auto text-foreground" />
  );
}

function EmptyStateActions({
  shouldReduceMotion,
  showExploreCta,
  showPlanCreationCta,
}: {
  shouldReduceMotion: boolean | null;
  showExploreCta: boolean;
  showPlanCreationCta: boolean;
}) {
  if (!(showPlanCreationCta || showExploreCta)) {
    return null;
  }

  const motionProps = getEmptyActionsMotionProps(shouldReduceMotion);

  return (
    <LazyMotion features={domMax}>
      <m.div
        initial={motionProps.initial}
        animate={motionProps.animate}
        transition={motionProps.transition}
        className="mt-6 flex w-full max-w-44 flex-col items-stretch gap-2.5"
      >
        <ExploreEmptyStateAction isVisible={showExploreCta} />
        <PlanCreationEmptyStateAction isVisible={showPlanCreationCta} />
      </m.div>
    </LazyMotion>
  );
}

function getEmptyActionsMotionProps(shouldReduceMotion: boolean | null) {
  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

  return {
    initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 },
    animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: {
      duration: shouldReduceMotion ? 0.08 : 0.12,
      ease,
    },
  };
}

function ExploreEmptyStateAction({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <Button asChild variant="outline" size="sm" className="w-full rounded-lg">
      <Link {...buildExploreNavigation()}>Browse groups</Link>
    </Button>
  );
}

function PlanCreationEmptyStateAction({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <Button asChild variant="primary" size="sm" className="w-full rounded-lg">
      <Link {...buildPlanCreationLaunchNavigation()}>
        <UsersRound size={14} aria-hidden="true" />
        Start a plan
      </Link>
    </Button>
  );
}

function getEmptyStateDescription({
  showExploreCta,
  showPlanCreationCta,
}: {
  showExploreCta: boolean;
  showPlanCreationCta: boolean;
}) {
  return emptyDescriptionByCtaState[
    getEmptyDescriptionCtaState({ showExploreCta, showPlanCreationCta })
  ];
}

function getEmptyDescriptionCtaState({
  showExploreCta,
  showPlanCreationCta,
}: {
  showExploreCta: boolean;
  showPlanCreationCta: boolean;
}): keyof typeof emptyDescriptionByCtaState {
  return `${showExploreCta}:${showPlanCreationCta}`;
}
