import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Settings } from "lucide-react";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { Avatar } from "@/shared/components/common/avatar";
import { SheetClose } from "@/shared/components/ui/sheet";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";
import { buildSettingsNavigation } from "@/shared/navigation/settings-navigation";
import type { User } from "@/shared/schemas";

const FALLBACK_PROFILE_SUMMARY = {
  avatar: undefined,
  avatarName: undefined,
  context: undefined,
  displayName: "Loading account",
  email: "Loading profile details",
};

export function UserMenuProfileSummary() {
  const { data: currentUser } = useCurrentUserQuery();
  const profileSummary = getUserMenuProfileSummary(currentUser);

  return (
    <section className="px-4 pb-3">
      <div className="rounded-2xl bg-card p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            src={profileSummary.avatar}
            name={profileSummary.avatarName}
            className="size-14 border border-forge-teal/20 bg-forge-teal/10 text-forge-teal"
            fallbackClassName="bg-forge-teal/10 text-base tracking-wide text-forge-teal"
            loading="eager"
          />

          <span className="min-w-0 flex-1">
            <span className="block truncate font-black text-foreground text-lg leading-tight">
              {profileSummary.displayName}
            </span>
            <span className="mt-0.5 block truncate text-muted-foreground text-sm">
              {profileSummary.email}
            </span>
            {profileSummary.context ? (
              <span className="mt-1 block truncate font-semibold text-forge-teal text-xs">
                {profileSummary.context}
              </span>
            ) : null}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 border-border/55 border-t pt-3">
          <SheetClose asChild>
            <Link
              {...getPublicProfileNavigation(currentUser)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-primary px-3 font-black text-primary-foreground text-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View profile
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              {...buildSettingsNavigation()}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border/70 px-3 font-bold text-foreground text-sm transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Settings className="size-4 text-forge-teal" aria-hidden="true" />
              Edit account
            </Link>
          </SheetClose>
        </div>
      </div>
    </section>
  );
}

function getUserMenuProfileSummary(currentUser: User | undefined) {
  if (!currentUser) {
    return FALLBACK_PROFILE_SUMMARY;
  }

  return {
    avatar: currentUser.avatar,
    avatarName: currentUser.name,
    context: [currentUser.personalityType, currentUser.city]
      .filter(Boolean)
      .join(" · "),
    displayName: currentUser.name,
    email: currentUser.email,
  };
}

function getPublicProfileNavigation(currentUser: User | undefined) {
  return currentUser?.id
    ? buildProfileNavigation(currentUser.id)
    : buildProfileNavigation();
}
