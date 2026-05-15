import { Link } from "@tanstack/react-router";
import { Check, Compass } from "lucide-react";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { Button } from "@/shared/components/ui/button";

import type {
  ExploreGroup,
  ExploreViewInsight,
  Interest,
} from "@/shared/schemas";
import type { OceanScores } from "@/shared/types/psychometrics";

interface ExploreLensCardProps {
  fallbackGroups?: ExploreGroup[];
  insight?: ExploreViewInsight;
  interests?: Interest[];
  mbti: string;
  oceanScores: OceanScores;
}

export function ExploreLensCard({
  fallbackGroups = [],
  insight,
  interests = [],
  mbti,
  oceanScores,
}: ExploreLensCardProps) {
  const lensInsight =
    insight ??
    getLensInsight({
      groups: fallbackGroups,
      interests,
      mbti,
      oceanScores,
    });

  return (
    <section
      aria-labelledby="explore-identity-heading"
      className="flex flex-col gap-4 px-1 py-1"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
          <Compass size={17} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h2
            id="explore-identity-heading"
            className="font-black text-base text-foreground leading-tight tracking-tight"
          >
            Why this view
          </h2>
          <p className="mt-0.5 font-semibold text-muted-foreground text-xs leading-relaxed">
            Tuned from your profile and results
          </p>
        </div>
      </div>

      <p className="font-medium text-foreground/90 text-sm leading-6">
        {lensInsight.summary}
      </p>

      <div className="font-semibold text-muted-foreground text-xs leading-5">
        <GuidanceBlock items={lensInsight.bullets} />
      </div>

      <Button asChild variant="outline" size="sm" className="w-full">
        <Link {...buildSettingsNavigation("matching")}>Tune group fit</Link>
      </Button>
    </section>
  );
}

function GuidanceBlock({ items }: { items: string[] }) {
  return (
    <div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <Check
              className="mt-0.5 shrink-0 text-forge-teal"
              size={13}
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <span className="min-w-0 leading-6">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getLensInsight({
  groups,
  interests,
  mbti,
  oceanScores,
}: {
  groups: ExploreGroup[];
  interests: Interest[];
  mbti: string;
  oceanScores: OceanScores;
}) {
  const stats = getResultStats(groups, interests);
  const isIntuitive = mbti[1] === "N";
  const isPerceiving = mbti[3] === "P";
  const topInterest = getTopInterestName(interests);
  const highOpenness = oceanScores.openness >= 70;
  const highConscientiousness = oceanScores.conscientiousness >= 70;
  const style = isIntuitive ? "idea-led" : "practical";
  const pace = isPerceiving ? "flexible starts" : "clear next steps";
  const interest = stats.topMatchingInterest ?? topInterest;
  const resultCount = groups.length;

  const summary = resultCount
    ? `Showing ${style} openings${interest ? ` around ${interest}` : ""} with ${pace}, then favoring groups that are easier to act on.`
    : `Ready to prioritize ${style} openings${interest ? ` around ${interest}` : ""} with ${pace} once groups are available.`;

  const bullets = [
    getTimingBullet(stats.scheduledCount, highConscientiousness),
    getJoinBullet(stats.openJoinCount),
    getInterestBullet(stats.topMatchingInterest, interest),
    getPlaceBullet(stats.localCount),
  ];

  if (highOpenness && !highConscientiousness && stats.smallRoomCount > 0) {
    bullets[3] = `${stats.smallRoomCount} ${pluralize("room", stats.smallRoomCount)} ${stats.smallRoomCount === 1 ? "keeps" : "keep"} enough space to shape the plan.`;
  }

  return { bullets, summary };
}

function getResultStats(groups: ExploreGroup[], interests: Interest[]) {
  const interestNames = new Set(
    interests.map((interest) => interest.name.toLowerCase()),
  );
  const matchingInterestCounts = new Map<string, number>();
  let scheduledCount = 0;
  let openJoinCount = 0;
  let localCount = 0;
  let smallRoomCount = 0;

  for (const group of groups) {
    if (group.plan?.dateTime) {
      scheduledCount += 1;
    }

    if (group.access === "OPEN" && !isGroupFull(group)) {
      openJoinCount += 1;
    }

    if (group.plan?.locationMode !== "ONLINE" && group.activity.city) {
      localCount += 1;
    }

    if (group.activeMembersCount <= 4 && !isGroupFull(group)) {
      smallRoomCount += 1;
    }

    for (const interest of group.activity.interests) {
      if (!interestNames.has(interest.name.toLowerCase())) {
        continue;
      }

      matchingInterestCounts.set(
        interest.name,
        (matchingInterestCounts.get(interest.name) ?? 0) + 1,
      );
    }
  }

  return {
    localCount,
    openJoinCount,
    scheduledCount,
    smallRoomCount,
    topMatchingInterest: getTopCountLabel(matchingInterestCounts),
  };
}

function getTimingBullet(
  scheduledCount: number,
  highConscientiousness: boolean,
) {
  if (scheduledCount > 0) {
    return `${scheduledCount} ${pluralize("plan", scheduledCount)} already ${scheduledCount === 1 ? "has" : "have"} a time attached.`;
  }

  return highConscientiousness
    ? "Clear time and place will move groups higher."
    : "Openings with a clear first step will stand out.";
}

function getJoinBullet(openJoinCount: number) {
  return openJoinCount > 0
    ? `${openJoinCount} ${pluralize("group", openJoinCount)} can be joined without a request.`
    : "Request-only groups stay visible when the plan looks strong.";
}

function getInterestBullet(
  topMatchingInterest: string | null,
  fallbackInterest: string | undefined,
) {
  if (topMatchingInterest) {
    return `${topMatchingInterest} appears most often in the current results.`;
  }

  return fallbackInterest
    ? `Plans connected to ${fallbackInterest} will get extra attention.`
    : "Shared interests will carry more weight than generic activity labels.";
}

function getPlaceBullet(localCount: number) {
  return localCount > 0
    ? `${localCount} ${pluralize("opening", localCount)} ${localCount === 1 ? "is" : "are"} local or place-ready.`
    : "Online or location-light groups stay lower unless the plan is strong.";
}

function getTopCountLabel(counts: Map<string, number>) {
  let topLabel: string | null = null;
  let topCount = 0;

  for (const [label, count] of counts) {
    if (count > topCount) {
      topLabel = label;
      topCount = count;
    }
  }

  return topLabel;
}

function isGroupFull(group: ExploreGroup) {
  return group.maxMembers > 0 && group.activeMembersCount >= group.maxMembers;
}

function pluralize(label: string, count: number) {
  return count === 1 ? label : `${label}s`;
}

function getTopInterestName(interests: Interest[]) {
  return (
    interests.find((interest) => interest.isActive)?.name ?? interests[0]?.name
  );
}
