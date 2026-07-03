import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import type { ForgeIdeaLaunch } from "@/shared/navigation/forge-navigation";

import type { TokenNormalizationRule } from "./types";

const TITLE_TOKEN_WEIGHT = 2.4;
const DETAIL_TOKEN_WEIGHT = 1.35;
const EVENT_DESCRIPTION_TOKEN_WEIGHT = 0.55;
const TOKEN_NORMALIZATION_OVERRIDES = new Map([
  ["photowalk", "photo"],
  ["movies", "movie"],
]);
const TOKEN_SUFFIX_NORMALIZATION_RULES: readonly TokenNormalizationRule[] = [
  {
    minLength: 6,
    normalize: (token) => `${token.slice(0, -3)}y`,
    suffix: "ies",
  },
  {
    minLength: 6,
    normalize: (token) => removeTrailingDoubleConsonant(token.slice(0, -3)),
    suffix: "ing",
  },
  {
    minLength: 5,
    normalize: (token) => removeTrailingDoubleConsonant(token.slice(0, -2)),
    suffix: "ed",
  },
  {
    minLength: 5,
    normalize: (token) => token.slice(0, -1),
    suffix: "s",
  },
];
const MEANINGFUL_SHORT_TEMPLATE_TOKENS = new Set([
  "2d",
  "3d",
  "ai",
  "ar",
  "dj",
  "ui",
  "ux",
  "vr",
]);
const TEMPLATE_STOP_WORDS = new Set([
  "and",
  "clear",
  "easy",
  "first",
  "for",
  "group",
  "into",
  "meet",
  "one",
  "people",
  "public",
  "simple",
  "small",
  "the",
  "this",
  "with",
]);

export function getIdeaTokenWeights(idea: ForgeIdeaLaunch) {
  const weights = new Map<string, number>();

  addWeightedTokens(weights, idea.title, TITLE_TOKEN_WEIGHT);
  addWeightedTokens(weights, idea.detail, DETAIL_TOKEN_WEIGHT);
  addWeightedTokens(
    weights,
    idea.eventDescription ?? "",
    EVENT_DESCRIPTION_TOKEN_WEIGHT,
  );

  return weights;
}

function addWeightedTokens(
  weights: Map<string, number>,
  value: string,
  weight: number,
) {
  for (const token of getTextTokens(value)) {
    weights.set(token, Math.max(weights.get(token) ?? 0, weight));
  }
}

export function getSeedTokens(seed: TemplateSeed) {
  return {
    body: new Set(
      getTextTokens(
        `${seed.description} ${seed.groupName} ${seed.groupDescription}`,
      ),
    ),
    hints: new Set(getTextTokens((seed.interestHints ?? []).join(" "))),
    title: new Set(getTextTokens(seed.title)),
  };
}

function getTextTokens(value: string) {
  return normalizeForMatching(value)
    .split(/[^a-z0-9]+/)
    .map((token) => normalizeToken(token))
    .filter(
      (token) =>
        (token.length >= 3 || MEANINGFUL_SHORT_TEMPLATE_TOKENS.has(token)) &&
        !TEMPLATE_STOP_WORDS.has(token),
    );
}

export function normalizeForMatching(value: string) {
  return value
    .normalize("NFKD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replaceAll("&", " and ");
}

function normalizeToken(token: string) {
  return (
    TOKEN_NORMALIZATION_OVERRIDES.get(token) ??
    normalizeTokenSuffix(token) ??
    token
  );
}

function normalizeTokenSuffix(token: string) {
  const rule = TOKEN_SUFFIX_NORMALIZATION_RULES.find((candidate) =>
    matchesTokenNormalizationRule(token, candidate),
  );

  return rule?.normalize(token) ?? null;
}

function matchesTokenNormalizationRule(
  token: string,
  rule: TokenNormalizationRule,
) {
  return token.length >= rule.minLength && token.endsWith(rule.suffix);
}

function removeTrailingDoubleConsonant(value: string) {
  const lastCharacter = value.at(-1);
  const previousCharacter = value.at(-2);

  if (
    lastCharacter &&
    lastCharacter === previousCharacter &&
    !/[aeiou]/.test(lastCharacter)
  ) {
    return value.slice(0, -1);
  }

  return value;
}
