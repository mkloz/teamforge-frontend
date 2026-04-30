export const PLAN_COVER_PRESETS = [
  {
    id: "teal",
    gradient: "from-teal-500 to-teal-700",
    label: "Teal",
  },
  {
    id: "ember",
    gradient: "from-amber-400 to-orange-500",
    label: "Ember",
  },
  {
    id: "forest",
    gradient: "from-emerald-500 to-green-700",
    label: "Forest",
  },
  {
    id: "rose",
    gradient: "from-rose-400 to-rose-600",
    label: "Rose",
  },
  {
    id: "midnight",
    gradient: "from-slate-700 to-slate-900",
    label: "Midnight",
  },
  {
    id: "sky",
    gradient: "from-sky-400 to-blue-600",
    label: "Sky",
  },
] as const;

export type PlanCoverPresetId = (typeof PLAN_COVER_PRESETS)[number]["id"];

export function getPlanCoverPreset(value?: string | null) {
  return PLAN_COVER_PRESETS.find((preset) => preset.id === value) ?? null;
}
