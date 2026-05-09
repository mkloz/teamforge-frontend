import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useExploreGroups } from "@/features/explore/hooks/use-explore-groups";
import { useExploreIdentity } from "@/features/explore/hooks/use-explore-identity";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/features/onboarding/lib/onboarding-route";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { Button } from "@/shared/components/ui/button";
import type { User } from "@/shared/schemas";
import { ExploreLensCard } from "./explore-lens-card";
import { ForgeCTA } from "./forge-cta";

function hasCompleteOceanProfile(user: User) {
  return (
    user.oceanO !== null &&
    user.oceanC !== null &&
    user.oceanE !== null &&
    user.oceanA !== null &&
    user.oceanN !== null
  );
}

export function ExploreLeftSection() {
  const identity = useExploreIdentity();
  const { data: exploreData } = useExploreGroups();
  const { data: currentUser, isLoading } = useQuery(currentUserQueryOptions());

  return (
    <aside className="flex flex-col gap-5">
      <div className="hidden space-y-1.5 px-1 md:block">
        <h1 className="font-black text-2xl text-foreground leading-tight tracking-tight">
          Explore
        </h1>
        <p className="font-medium text-muted-foreground text-sm leading-relaxed">
          Open groups with timing and room to join.
        </p>
      </div>

      {identity ? (
        <ExploreLensCard
          fallbackGroups={exploreData?.groups ?? []}
          insight={exploreData?.insight}
          mbti={identity.mbti}
          oceanScores={identity.oceanScores}
          interests={currentUser?.interests ?? []}
        />
      ) : isLoading ? (
        <div className="rounded-xl border border-border/70 bg-card/40 p-4 font-medium text-slate-muted text-sm">
          Loading your compatibility profile.
        </div>
      ) : currentUser && !currentUser.emailVerified ? (
        <div className="rounded-xl border border-border/70 bg-card/40 p-4 font-medium text-slate-muted text-sm">
          <p className="leading-relaxed">
            Verify your account to keep your explore signals and recovery
            settings in good shape.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link {...buildSettingsNavigation("security")}>Open security</Link>
          </Button>
        </div>
      ) : currentUser &&
        (!currentUser.personalityType ||
          !hasCompleteOceanProfile(currentUser)) ? (
        <div className="rounded-xl border border-border/70 bg-card/40 p-4 font-medium text-slate-muted text-sm">
          <p className="leading-relaxed">
            Complete your personality profile to unlock compatibility insights
            here.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link
              {...buildPersonalityEditNavigation({
                returnTo: "/explore",
              })}
            >
              Update personality
            </Link>
          </Button>
        </div>
      ) : currentUser && !(currentUser.interests?.length ?? 0) ? (
        <div className="rounded-xl border border-border/70 bg-card/40 p-4 font-medium text-slate-muted text-sm">
          <p className="leading-relaxed">
            Add your interests so explore can rank groups around what you
            actually want to do.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link
              {...buildInterestsEditNavigation({
                returnTo: "/explore",
              })}
            >
              Add interests
            </Link>
          </Button>
        </div>
      ) : currentUser ? (
        <div className="rounded-xl border border-border/70 bg-card/40 p-4 font-medium text-slate-muted text-sm">
          Your compatibility profile is still syncing.
        </div>
      ) : (
        <div className="rounded-xl border border-border/70 bg-card/40 p-4 font-medium text-slate-muted text-sm">
          Sign in to see your compatibility profile.
        </div>
      )}

      <div className="px-1 pt-0.5">
        <ForgeCTA />
      </div>
    </aside>
  );
}
