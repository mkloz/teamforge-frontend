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
    getEmptyStateDescription({
      showExploreCta,
      showForgeCta,
    });

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-6 py-12 text-center">
      {artwork === "filtered" ? (
        <EmptyConversationsFilteredVisual className="mx-auto h-36 w-auto text-foreground" />
      ) : (
        <EmptyConversationsVisual className="mx-auto h-36 w-auto text-foreground" />
      )}

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

      {(showForgeCta || showExploreCta) && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.08 : 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-6 flex w-full max-w-44 flex-col items-stretch gap-2.5"
        >
          {showExploreCta && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full rounded-lg"
            >
              <Link {...buildExploreNavigation()}>Browse groups</Link>
            </Button>
          )}

          {showForgeCta && (
            <Button
              asChild
              variant="primary"
              size="sm"
              className="w-full rounded-lg"
            >
              <Link {...buildForgeLaunchNavigation()}>
                <UsersRound size={14} aria-hidden="true" />
                Forge a group
              </Link>
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
});

function getEmptyStateDescription({
  showExploreCta,
  showForgeCta,
}: {
  showExploreCta: boolean;
  showForgeCta: boolean;
}) {
  if (showExploreCta && showForgeCta) {
    return "Browse open groups or forge one around your own plan.";
  }

  if (showForgeCta) {
    return "Forge a group to start your first conversation.";
  }

  if (showExploreCta) {
    return "Browse open groups to find a conversation worth joining.";
  }

  return null;
}
