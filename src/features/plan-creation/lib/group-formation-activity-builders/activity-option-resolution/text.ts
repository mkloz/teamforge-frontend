import { normalizeSearchText } from "@/shared/lib/fuzzy";
import {
  ACTIVITY_STOP_WORDS,
  MEANINGFUL_SHORT_ACTIVITY_TOKENS,
} from "./constants";

export function normalizeActivityText(value: string) {
  return normalizeSearchText(value);
}

export function normalizeActivityToken(value: string) {
  return normalizeActivityText(value).replaceAll(/[^a-z0-9]+/g, "");
}

export function getActivitySearchTokens(value: string) {
  return normalizeSearchText(value)
    .split(/\s+/)
    .filter(isMeaningfulActivityToken);
}

function isMeaningfulActivityToken(token: string) {
  return (
    (token.length >= 3 || MEANINGFUL_SHORT_ACTIVITY_TOKENS.has(token)) &&
    !ACTIVITY_STOP_WORDS.has(token)
  );
}
