import { TeamForgeLogo } from "@/assets/logo";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";

interface OnboardingHomeLinkProps {
  className?: string;
}

export function OnboardingHomeLink({ className }: OnboardingHomeLinkProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-3 top-3 z-[60] sm:right-5 sm:top-4 lg:right-4 xl:right-5",
        className,
      )}
    >
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="pointer-events-auto h-10 w-10 rounded-lg p-0 text-white/80 hover:bg-white/5 hover:text-white focus-visible:ring-forge-teal focus-visible:ring-offset-hero-bg"
      >
        <Link to="/" aria-label="Back to TeamForge home">
          <TeamForgeLogo className="size-10" showBackground={false} />
        </Link>
      </Button>
    </div>
  );
}
