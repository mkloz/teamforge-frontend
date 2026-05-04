import { IdentityCard } from "./identity-card";
import { ForgeCTA } from "./forge-cta";
import { useExploreIdentity } from "@/features/explore/hooks/use-explore-identity";
import { useQuery } from "@tanstack/react-query";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import type { User } from "@/shared/schemas";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/features/onboarding/lib/onboarding-route";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { Link } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";

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
  const { data: currentUser, isLoading } = useQuery(currentUserQueryOptions());

  return (
    <aside className="flex flex-col gap-4">
      <div className="hidden md:block space-y-0.5 px-1">
        <h1 className="text-2xl font-black text-foreground tracking-tighter leading-none">
          Explore
        </h1>
        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
          Discover intelligent group formations. The algorithm matches you based
          on personality vectors and shared interests.
        </p>
      </div>

      {/* 1. Identity & Algorithm Context */}
      {identity ? (
        <IdentityCard
          mbti={identity.mbti}
          trustScore={identity.trustScore}
          oceanScores={identity.oceanScores}
        />
      ) : isLoading ? (
        <div className="rounded-3xl border-2 border-border bg-canvas/40 p-4 text-sm font-medium text-slate-muted">
          Loading your compatibility profile.
        </div>
      ) : currentUser && !currentUser.emailVerified ? (
        <div className="rounded-3xl border-2 border-border bg-canvas/40 p-4 text-sm font-medium text-slate-muted">
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
        <div className="rounded-3xl border-2 border-border bg-canvas/40 p-4 text-sm font-medium text-slate-muted">
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
        <div className="rounded-3xl border-2 border-border bg-canvas/40 p-4 text-sm font-medium text-slate-muted">
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
        <div className="rounded-3xl border-2 border-border bg-canvas/40 p-4 text-sm font-medium text-slate-muted">
          Your compatibility profile is still syncing.
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-border bg-canvas/40 p-4 text-sm font-medium text-slate-muted">
          Sign in to see your compatibility profile.
        </div>
      )}

      {/* 2. Action / CTA */}
      <div className="px-1">
        <ForgeCTA />
      </div>
    </aside>
  );
}
