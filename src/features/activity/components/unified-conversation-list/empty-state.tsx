import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { UsersRound } from "lucide-react";
import { memo } from "react";
import { EmptyConversationsVisual } from "@/features/activity/assets/empty-conversations";
import { EmptyConversationsFilteredVisual } from "@/features/activity/assets/empty-conversations-filtered";
import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { Button } from "@/shared/components/ui/button";

type ConversationEmptyArtwork = "default" | "filtered";

const emptyDescriptionByCtaState = {
  "false:false": null,
  "false:true": "Forge a group to start your first conversation.",
  "true:false": "Browse open groups to find a conversation worth joining.",
  "true:true": "Browse open groups or forge one around your own plan.",
} as const;

interface EmptyStateProps {
  label: string;
  description?: string | null;
  artwork?: ConversationEmptyArtwork;
  /** When true shows the Forge CTA — used for the "No conversations yet" base empty state */
  showForgeCta?: boolean;
  showExploreCta?: boolean;
}

export const EmptyState = memo(function EmptyState({
  label,
  description: descriptionProp,
  artwork = "default",
  showForgeCta = false,
  showExploreCta = false,
}: EmptyStateProps) {
  const shouldReduceMotion = useReducedMotion();
  const description =
    descriptionProp ??
    getEmptyStateDescription({ showExploreCta, showForgeCta });

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
        showForgeCta={showForgeCta}
      />
    </div>
  );
});

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
  showForgeCta,
}: {
  shouldReduceMotion: boolean | null;
  showExploreCta: boolean;
  showForgeCta: boolean;
}) {
  if (!(showForgeCta || showExploreCta)) {
    return null;
  }

  const motionProps = getEmptyActionsMotionProps(shouldReduceMotion);

  return (
    <motion.div
      initial={motionProps.initial}
      animate={motionProps.animate}
      transition={motionProps.transition}
      className="mt-6 flex w-full max-w-44 flex-col items-stretch gap-2.5"
    >
      <ExploreEmptyStateAction isVisible={showExploreCta} />
      <ForgeEmptyStateAction isVisible={showForgeCta} />
    </motion.div>
  );
}

function getEmptyActionsMotionProps(shouldReduceMotion: boolean | null) {
  return {
    initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 },
    animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: {
      duration: shouldReduceMotion ? 0.08 : 0.12,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
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

function ForgeEmptyStateAction({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <Button asChild variant="primary" size="sm" className="w-full rounded-lg">
      <Link {...buildForgeLaunchNavigation()}>
        <UsersRound size={14} aria-hidden="true" />
        Forge a group
      </Link>
    </Button>
  );
}

function getEmptyStateDescription({
  showExploreCta,
  showForgeCta,
}: {
  showExploreCta: boolean;
  showForgeCta: boolean;
}) {
  return emptyDescriptionByCtaState[
    getEmptyDescriptionCtaState({ showExploreCta, showForgeCta })
  ];
}

function getEmptyDescriptionCtaState({
  showExploreCta,
  showForgeCta,
}: {
  showExploreCta: boolean;
  showForgeCta: boolean;
}): keyof typeof emptyDescriptionByCtaState {
  return `${showExploreCta}:${showForgeCta}`;
}
