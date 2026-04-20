import { IdentityCard } from "./identity-card";
import { ForgeCTA } from "./forge-cta";
import { MOCK_USER } from "../data/mock-explore";

export function ExploreLeftSection() {
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
      <IdentityCard
        mbti={MOCK_USER.mbti}
        trustScore={MOCK_USER.trustScore}
        oceanScores={MOCK_USER.oceanScores}
      />

      {/* 2. Action / CTA */}
      <div className="px-1">
        <ForgeCTA />
      </div>
    </aside>
  );
}
