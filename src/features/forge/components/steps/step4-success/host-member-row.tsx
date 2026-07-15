import { Link } from "@tanstack/react-router";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";

export function HostMemberRow() {
  return (
    <div className="group relative flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/50">
      <Link
        {...buildProfileNavigation()}
        aria-label="View your profile"
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="sr-only">View your profile</span>
      </Link>

      {/* Use a "You" badge instead of an avatar for the host row. */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forge-teal font-bold text-micro text-primary-foreground ring-2 ring-forge-teal/30">
        You
      </div>

      {/* Identity */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="font-black text-forge-teal text-sm leading-tight">
            You
          </p>
          <StatusPill
            tone="teal"
            size="xs"
            surface="solid"
            className="h-4 shrink-0 px-1.5 py-0 leading-4"
          >
            Host
          </StatusPill>
        </div>
        <p className="mt-0.5 text-muted-foreground text-xs">Group organiser</p>
      </div>
    </div>
  );
}
