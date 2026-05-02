import { MessageSquare, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { memo } from "react";
import { Button } from "@/shared/components/ui/button";
import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";

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
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20 px-6 text-center animate-in fade-in slide-in-from-bottom-2">
      <div className="w-14 h-14 rounded-2xl bg-forge-teal/8 flex items-center justify-center shadow-sm border border-forge-teal/15">
        <MessageSquare
          size={22}
          className="text-forge-teal"
          strokeWidth={1.5}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-ink/80">{label}</p>
        {showForgeCta && (
          <p className="text-xs text-slate-muted leading-relaxed max-w-45 mx-auto">
            Let's forge your first one.
          </p>
        )}
      </div>
      {(showForgeCta || showExploreCta) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {showExploreCta && (
            <Button asChild variant="outline" size="sm">
              <Link {...buildExploreNavigation()}>Browse groups</Link>
            </Button>
          )}
          {showForgeCta && (
            <Link
              {...buildForgeLaunchNavigation()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forge-teal text-white text-xs font-bold tracking-tight shadow-sm hover:bg-forge-teal/90 active:scale-95 transition-all duration-200"
            >
              <Zap size={13} className="fill-current" />
              Forge a group
            </Link>
          )}
        </div>
      )}
    </div>
  );
});
