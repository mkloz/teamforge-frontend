import { Link } from "@tanstack/react-router";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { Avatar } from "@/shared/components/common/avatar";
import { SheetClose } from "@/shared/components/ui/sheet";

export function UserMenuProfileSummary() {
  const { data: currentUser } = useCurrentUserQuery();

  return (
    <section className="px-5 py-4">
      <SheetClose asChild>
        <Link
          {...buildProfileNavigation()}
          className="group flex min-w-0 items-center gap-3 rounded-xl p-1 transition-colors hover:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open your public profile"
        >
          <Avatar
            src={currentUser?.avatar}
            name={currentUser?.name}
            className="size-10 border border-forge-teal/20 bg-forge-teal/10 text-forge-teal shadow-sm transition-transform group-hover:scale-105"
            fallbackClassName="bg-forge-teal/10 text-sm tracking-wide text-forge-teal"
            loading="eager"
          />

          <span className="min-w-0 flex-1">
            <span className="block truncate font-black text-base text-foreground leading-tight transition-colors group-hover:text-forge-teal">
              {currentUser?.name ?? "Account details syncing"}
            </span>
            <span className="mt-1 block truncate font-medium text-muted-foreground text-sm">
              {currentUser?.email ?? "Your session is active"}
            </span>
          </span>
        </Link>
      </SheetClose>
    </section>
  );
}
