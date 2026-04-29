import { IdentityCard } from "./identity-card";
import { ForgeCTA } from "./forge-cta";
import { useExploreIdentity } from "../hooks/use-explore-identity";
import { AuthQueries } from "@/features/auth/api/auth.queries";

export function ExploreLeftSection() {
  const identity = useExploreIdentity();
  const { data: currentUser, isLoading } = AuthQueries.useCurrentUser();

  return (
    <aside className="flex flex-col gap-5">
      <div className="hidden md:block space-y-0.5 px-1">
        <h1 className="text-3xl font-black text-foreground tracking-tighter leading-none">
          Explore
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
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
      ) : currentUser ? (
        <div className="rounded-3xl border-2 border-border bg-canvas/40 p-4 text-sm font-medium text-slate-muted">
          Complete your personality profile to unlock compatibility insights
          here.
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
