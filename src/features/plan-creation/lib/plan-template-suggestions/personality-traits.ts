import type { ActivityOption } from "@/features/plan-creation/constants/plan-creation.constants";
import {
  CATEGORY_TRAITS,
  TRAIT_KEYWORDS,
} from "@/features/plan-creation/data/plan-template-fit-signals";
import type {
  TemplateSeed,
  TemplateTrait,
} from "@/features/plan-creation/data/plan-template-seed-types";
import type { User } from "@/shared/schemas";

import {
  OCEAN_TRAIT_RULES,
  PERSONALITY_TYPE_TRAIT_RULES,
  TEMPLATE_TRAIT_VALUES,
} from "./constants";
import { getCategoryBaseText } from "./selectors";
import {
  getExpandedTextTokens,
  getNormalizedPhrase,
  getTextTokens,
} from "./text";
import type { OceanTraitRule, TraitWeights, WeightedTraits } from "./types";

function addWeightedTrait(
  traits: WeightedTraits,
  trait: TemplateTrait,
  weight: number,
) {
  traits.set(trait, Math.max(traits.get(trait) ?? 0, weight));
}

function addWeightedTraits(traits: WeightedTraits, traitWeights: TraitWeights) {
  for (const [trait, weight] of traitWeights) {
    addWeightedTrait(traits, trait, weight);
  }
}

export function getUserInterestSignals(user: User | undefined) {
  const phrases = new Set<string>();
  const tokens = new Set<string>();

  for (const interest of user?.interests ?? []) {
    const labels = [interest.name, interest.slug, ...(interest.aliases ?? [])];

    for (const label of labels) {
      const phrase = getNormalizedPhrase(label);

      if (phrase) {
        phrases.add(phrase);
      }

      for (const token of getTextTokens(label)) {
        tokens.add(token);
      }

      for (const token of getExpandedTextTokens(label)) {
        tokens.add(token);
      }
    }
  }

  return { phrases, tokens };
}

function getCandidateText(seed: TemplateSeed, category: ActivityOption) {
  return [
    seed.title,
    seed.description,
    seed.groupName,
    seed.groupDescription,
    getCategoryBaseText(category),
    ...(seed.interestHints ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

function getTemplateTraits(seed: TemplateSeed, category: ActivityOption) {
  const text = getCandidateText(seed, category);
  const candidatePhrase = ` ${getNormalizedPhrase(text)} `;
  const candidateTokens = new Set(getTextTokens(text));
  const traits: WeightedTraits = new Map();

  for (const trait of CATEGORY_TRAITS[category.id] ?? []) {
    addWeightedTrait(traits, trait, 0.35);
  }

  if (seed.recommendedMaximumGroupSize <= 5) {
    addWeightedTrait(traits, "small-group", 1.1);
  }

  if (seed.locationType === "ONLINE") {
    addWeightedTrait(traits, "online", 1);
  }

  for (const trait of TEMPLATE_TRAIT_VALUES) {
    const keywords = TRAIT_KEYWORDS[trait];
    const matchCount = keywords.filter((keyword) => {
      const normalizedKeyword = getNormalizedPhrase(keyword);

      if (!normalizedKeyword) {
        return false;
      }

      if (normalizedKeyword.includes(" ")) {
        return candidatePhrase.includes(` ${normalizedKeyword} `);
      }

      return candidateTokens.has(normalizedKeyword);
    }).length;

    if (matchCount > 0) {
      addWeightedTrait(traits, trait, Math.min(1, 0.45 + matchCount * 0.18));
    }
  }

  return traits;
}

function getPersonalityTraits(user: User | undefined): WeightedTraits {
  const traits: WeightedTraits = new Map();
  applyPersonalityTypeTraits(traits, user?.personalityType);
  applyOceanTraits(traits, user);

  return traits;
}

function applyPersonalityTypeTraits(
  traits: WeightedTraits,
  personalityType: string | null | undefined,
): void {
  if (!personalityType) {
    return;
  }

  PERSONALITY_TYPE_TRAIT_RULES.forEach((rule, index) => {
    addWeightedTraits(
      traits,
      personalityType[index] === rule.preferredValue
        ? rule.preferredTraits
        : rule.fallbackTraits,
    );
  });
}

function applyOceanTraits(
  traits: WeightedTraits,
  user: User | undefined,
): void {
  for (const rule of OCEAN_TRAIT_RULES) {
    applyOceanTraitRule(traits, user?.[rule.score], rule);
  }
}

function applyOceanTraitRule(
  traits: WeightedTraits,
  score: number | null | undefined,
  rule: OceanTraitRule,
): void {
  if (typeof score !== "number") {
    return;
  }

  if (score >= rule.highThreshold) {
    addWeightedTraits(traits, rule.highTraits);
    return;
  }

  if (score <= rule.lowThreshold) {
    addWeightedTraits(traits, rule.lowTraits);
  }
}

export function getTraitScore(
  seed: TemplateSeed,
  category: ActivityOption,
  user: User | undefined,
) {
  const templateTraits = getTemplateTraits(seed, category);
  const userTraits = getPersonalityTraits(user);
  let score = 0;

  for (const [trait, templateWeight] of templateTraits) {
    const userWeight = userTraits.get(trait);

    if (userWeight) {
      score +=
        templateWeight * userWeight * (trait === "small-group" ? 1.15 : 1);
    }
  }

  return Math.min(score, 5);
}
