import { ACTIVITY_NAME_POOLS } from "@/features/forge/data/forge-group-name-pools";

export function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];

  while (out.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }

  return out;
}

export function getPoolForActivity(
  activity: string | null | undefined,
): string[] {
  if (!activity) {
    return ACTIVITY_NAME_POOLS.default;
  }

  const lower = activity.toLowerCase();
  const key = Object.keys(ACTIVITY_NAME_POOLS).find((candidate) =>
    lower.includes(candidate),
  );

  return ACTIVITY_NAME_POOLS[key ?? "default"];
}

export function filterAvailableGroupNames(
  names: string[],
  existingGroupNames: string[],
) {
  const taken = existingGroupNames.map((name) => name.toLowerCase());

  return names.filter((name) => !taken.includes(name.toLowerCase()));
}

export function buildGroupNameSuggestions(
  selectedActivity: string | null | undefined,
  existingGroupNames: string[],
  suggestionCount: number,
) {
  return pickRandom(
    filterAvailableGroupNames(
      getPoolForActivity(selectedActivity),
      existingGroupNames,
    ),
    suggestionCount,
  );
}
