import { Link } from "@tanstack/react-router";
import { UsersRound } from "lucide-react";
import { memo } from "react";
import { EmptyConversationsVisual } from "@/assets/empty-state/empty-conversations";
import { EmptyConversationsFilteredVisual } from "@/assets/empty-state/empty-conversations-filtered";
import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { Button } from "@/shared/components/ui/button";

type ConversationEmptyArtwork = "default" | "filtered";

interface EmptyStateProps {
  label: string;
  artwork?: ConversationEmptyArtwork;
  /** When true shows the Forge CTA — used for the "No conversations yet" base empty state */
  showForgeCta?: boolean;
  showExploreCta?: boolean;
}

export const EmptyState = memo(function EmptyState({
  label,
  artwork = "default",
  showForgeCta = false,
  showExploreCta = false,
}: EmptyStateProps) {
  const description = getEmptyStateDescription({
    showExploreCta,
    showForgeCta,
  });

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {artwork === "filtered" ? (
        <EmptyConversationsFilteredVisual className="mx-auto w-40 text-foreground" />
      ) : (
        <EmptyConversationsVisual className="mx-auto w-40 text-foreground" />
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
        <div className="mt-6 flex w-full max-w-44 flex-col items-stretch gap-2.5">
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
        </div>
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
