import { Link } from "@tanstack/react-router";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { Avatar } from "@/shared/components/common/avatar";
import { SheetClose } from "@/shared/components/ui/sheet";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";

export function UserMenuProfileSummary() {
  const { data: currentUser } = useCurrentUserQuery();
  const personalityType = currentUser?.personalityType;

  return (
    <section className="px-4 pt-4 pb-3">
      <SheetClose asChild>
        <Link
          {...buildProfileNavigation()}
          className="group flex min-w-0 items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open your profile"
        >
          <Avatar
            src={currentUser?.avatar}
            name={currentUser?.name}
            className="size-12 border border-forge-teal/20 bg-forge-teal/10 text-forge-teal shadow-sm transition-transform group-hover:scale-105"
            fallbackClassName="bg-forge-teal/10 text-sm tracking-wide text-forge-teal"
            loading="eager"
          />

          <span className="min-w-0 flex-1">
            <span className={cn("flex items-center gap-2")}>
              <span className="block truncate font-black text-base text-foreground leading-tight transition-colors group-hover:text-forge-teal">
                {currentUser?.name ?? "Account syncing"}
              </span>
              {personalityType && (
                <StatusPill
                  tone="teal"
                  size="xs"
                  surface="solid"
                  className="h-4 shrink-0 px-1.5 py-0 leading-4"
                >
                  {personalityType}
                </StatusPill>
              )}
            </span>
            <span className="mt-0.5 block truncate text-muted-foreground text-sm">
              {currentUser?.email ?? "Your session is active"}
            </span>
          </span>
        </Link>
      </SheetClose>
    </section>
  );
}
