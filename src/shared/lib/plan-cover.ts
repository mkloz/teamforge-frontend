export const PLAN_COVER_PRESETS = [
  {
    id: "teal",
    gradient: "from-forge-teal via-forge-teal/75 to-ink",
    label: "Forge",
  },
  {
    id: "ember",
    gradient: "from-spark-amber via-spark-amber/75 to-ink",
    label: "Ember",
  },
  {
    id: "forest",
    gradient: "from-forge-teal/70 via-slate-muted/45 to-ink",
    label: "Deep",
  },
  {
    id: "rose",
    gradient: "from-spark-amber/70 via-forge-teal/55 to-ink",
    label: "Signal",
  },
  {
    id: "midnight",
    gradient: "from-slate-muted via-ink to-ink",
    label: "Graphite",
  },
  {
    id: "sky",
    gradient: "from-canvas via-forge-teal/25 to-spark-amber/50",
    label: "Canvas",
  },
] as const;

export type PlanCoverPresetId = (typeof PLAN_COVER_PRESETS)[number]["id"];

export function getPlanCoverPreset(value?: string | null) {
  return PLAN_COVER_PRESETS.find((preset) => preset.id === value) ?? null;
}
