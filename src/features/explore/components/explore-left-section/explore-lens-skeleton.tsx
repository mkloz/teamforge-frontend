import { ExploreLensCard } from "@/features/explore/components/explore-left-section/explore-lens-card";
import { GeneratedSkeleton } from "@/shared/components/loading/generated-skeleton";

export const EXPLORE_LENS_SKELETON_NAME = "explore.lens";

const fixtureInsight = {
  summary:
    "Showing idea-led openings around design critique with flexible starts, then favoring groups that are easier to act on.",
  bullets: [
    "3 plans already have a time attached.",
    "2 groups can be joined without a request.",
    "Design critique appears most often in the current results.",
    "2 openings are local or place-ready.",
  ],
};

const fixtureOceanScores = {
  openness: 82,
  conscientiousness: 58,
  extraversion: 64,
  agreeableness: 71,
  neuroticism: 36,
};

export function ExploreLensSkeleton() {
  const fixture = <ExploreLensSkeletonFixture />;

  return (
    <GeneratedSkeleton
      name={EXPLORE_LENS_SKELETON_NAME}
      loading
      fixture={fixture}
    >
      {fixture}
    </GeneratedSkeleton>
  );
}

export function ExploreLensSkeletonFixture() {
  return (
    <ExploreLensCard
      insight={fixtureInsight}
      mbti="ENFP"
      oceanScores={fixtureOceanScores}
    />
  );
}
