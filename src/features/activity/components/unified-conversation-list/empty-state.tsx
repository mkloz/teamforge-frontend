import { Link } from "@tanstack/react-router";
import { MessageSquare, UsersRound } from "lucide-react";
import { memo } from "react";

import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { Button } from "@/shared/components/ui/button";

interface EmptyStateProps {
  label: string;
  /** When true shows the Forge CTA — used for the "No conversations yet" base empty state */
  showForgeCta?: boolean;
  showExploreCta?: boolean;
}

export const EmptyState = memo(function EmptyState({
  label,
  showForgeCta = false,
  showExploreCta = false,
}: EmptyStateProps) {
  const description = getEmptyStateDescription({
    showExploreCta,
    showForgeCta,
  });

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-in fade-in slide-in-from-bottom-2">
      <div className="flex size-13 items-center justify-center rounded-xl border border-forge-teal/20 bg-forge-teal/8 text-forge-teal shadow-[0_0_0_1px_rgba(13,148,136,0.04)]">
        <MessageSquare size={21} strokeWidth={1.5} aria-hidden="true" />
      </div>

      <div className="mt-5 max-w-52">
        <p className="text-base font-black leading-tight text-foreground">
          {label}
        </p>
        {description ? (
          <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
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
