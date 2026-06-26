import type { RecentForgeActivity } from "@/features/forge/api/forge.api";
import {
  ACTIVITIES,
  type ActivityOption,
} from "@/features/forge/constants/forge.constants";
import type { PlanCategory } from "@/features/forge/lib/forge-contract";

type ActivityGroup = RecentForgeActivity["group"];
type ActivityInterest = NonNullable<RecentForgeActivity["interests"]>[number];

export function getTextCategoryId(
  activity: RecentForgeActivity,
): PlanCategory | null {
  const text = getActivityCategoryText(activity).toLowerCase();
  let bestCategoryId: PlanCategory | null = null;
  let bestScore = 0;

  for (const category of ACTIVITIES) {
    const score = getCategoryTextScore(text, category);

    if (score > bestScore) {
      bestScore = score;
      bestCategoryId = category.id;
    }
  }

  return bestScore > 0 ? bestCategoryId : null;
}

function getActivityCategoryText(activity: RecentForgeActivity) {
  return getActivityCategoryTextParts(activity).filter(Boolean).join(" ");
}

function getActivityCategoryTextParts(activity: RecentForgeActivity) {
  return [
    activity.title,
    activity.description,
    ...getGroupCategoryTextParts(activity.group),
    ...getActivityInterestsCategoryTextParts(activity.interests),
  ];
}

function getGroupCategoryTextParts(group: ActivityGroup) {
  if (!group) {
    return [];
  }

  return [
    group.plan?.title,
    group.plan?.description,
    group.name,
    group.description,
  ];
}

function getActivityInterestsCategoryTextParts(
  interests: RecentForgeActivity["interests"],
) {
  return (interests ?? []).flatMap((interest) =>
    getInterestCategoryTextParts(interest),
  );
}

function getInterestCategoryTextParts(interest: ActivityInterest) {
  return [interest.name, interest.slug].concat(interest.aliases ?? []);
}

function getCategoryTextScore(text: string, category: ActivityOption) {
  const categoryTerms = tokenize(`${category.label} ${category.description}`);

  return categoryTerms.reduce(
    (sum, term) => sum + (text.includes(term) ? 1 : 0),
    0,
  );
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length >= 3);
}
