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
  return Math.min(Math.max(value, min), max);
}

export function roundScore(value: number) {
  return Math.round(value * 100) / 100;
}

export function normalizeText(values: Array<string | null | undefined>) {
  return values.filter(Boolean).join(" ").toLowerCase().trim();
}

export function normalizeTaxonomyId(value: string) {
  const normalized = value.toLowerCase().trim();
  const slug = normalized.replace(/[\s-]+/g, "_");

  return normalized === slug ? [normalized] : [normalized, slug];
}
