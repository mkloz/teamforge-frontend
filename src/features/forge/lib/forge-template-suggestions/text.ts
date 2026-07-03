import {
  MEANINGFUL_SHORT_TOKENS,
  STOP_WORDS,
  TEMPLATE_TOKEN_ALIASES,
} from "./constants";

export function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .toLowerCase();
}

function normalizeToken(token: string) {
  const normalized = normalizeText(token).replace(/[^a-z0-9]/g, "");

  if (normalized === "movies") {
    return "movie";
  }

  return normalizeInflectedToken(normalized);
}

function normalizeInflectedToken(normalized: string) {
  if (normalized.length > 5 && normalized.endsWith("ies")) {
    return `${normalized.slice(0, -3)}y`;
  }

  if (normalized.length > 5 && normalized.endsWith("ing")) {
    return normalizeRepeatedStem(normalized.slice(0, -3));
  }

  if (normalized.length > 4 && normalized.endsWith("ed")) {
    return normalizeRepeatedStem(normalized.slice(0, -2));
  }

  if (normalized.length > 4 && normalized.endsWith("s")) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

function normalizeRepeatedStem(stem: string) {
  return stem.at(-1) === stem.at(-2) ? stem.slice(0, -1) : stem;
}

export function getTextTokens(value: string) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .map(normalizeToken)
    .filter(
      (token) =>
        (token.length >= 3 || MEANINGFUL_SHORT_TOKENS.has(token)) &&
        !STOP_WORDS.has(token),
    );
}

export function getExpandedTextTokens(value: string) {
  return expandTokens(getTextTokens(value));
}

function expandTokens(tokens: Iterable<string>) {
  const expandedTokens = new Set<string>();

  for (const token of tokens) {
    expandedTokens.add(token);

    for (const alias of TEMPLATE_TOKEN_ALIASES[token] ?? []) {
      expandedTokens.add(normalizeToken(alias));
    }
  }

  return [...expandedTokens];
}

export function getNormalizedPhrase(value: string) {
  return getTextTokens(value).join(" ");
}
