export function getFirstName(name: string) {
  const [firstName] = name.trim().split(/\s+/);

  return firstName || "This profile";
}

export function scoreBool(value: boolean | undefined, score: number) {
  return value ? score : 0;
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

export function roundScore(value: number) {
  return Math.round(value * 100) / 100;
}

export function normalizeText(values: Array<string | null | undefined>) {
  return values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .normalize("NFKD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .replaceAll(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

export function normalizeTaxonomyId(value: string) {
  const normalized = normalizeText([value]);

  if (!normalized) {
    return [];
  }

  const slug = normalized
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replaceAll(/^_+|_+$/g, "");

  return normalized === slug ? [normalized] : [normalized, slug];
}
