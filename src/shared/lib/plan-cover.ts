interface PlanCoverPresetBase {
  id: string;
  label: string;
}

export interface GradientPlanCoverPreset extends PlanCoverPresetBase {
  kind: "gradient";
  gradient: string;
}

export interface ImagePlanCoverPreset extends PlanCoverPresetBase {
  kind: "image";
  src: string;
}

export type PlanCoverPreset = GradientPlanCoverPreset | ImagePlanCoverPreset;

export const PLAN_COVER_PRESETS = [
  {
    id: "clay-tokens",
    kind: "image",
    label: "Clay",
    src: "/group-covers/clay-tokens.png",
  },
  {
    id: "contour-paths",
    kind: "image",
    label: "Contour",
    src: "/group-covers/contour-paths.png",
  },
  {
    id: "risograph-table",
    kind: "image",
    label: "Riso",
    src: "/group-covers/risograph-table.png",
  },
  {
    id: "glass-paths",
    kind: "image",
    label: "Glass",
    src: "/group-covers/glass-paths.png",
  },
  {
    id: "paper-collage",
    kind: "image",
    label: "Collage",
    src: "/group-covers/paper-collage.png",
  },
  {
    id: "flat-social-map",
    kind: "image",
    label: "Map",
    src: "/group-covers/flat-social-map.png",
  },
  {
    id: "isometric-room",
    kind: "image",
    label: "Room",
    src: "/group-covers/isometric-room.png",
  },
  {
    id: "linocut-courtyard",
    kind: "image",
    label: "Linocut",
    src: "/group-covers/linocut-courtyard.png",
  },
  {
    id: "woven-paths",
    kind: "image",
    label: "Woven",
    src: "/group-covers/woven-paths.png",
  },
] as const satisfies readonly PlanCoverPreset[];

const LEGACY_PLAN_COVER_PRESETS = [
  {
    id: "teal",
    kind: "gradient",
    gradient: "from-forge-teal via-forge-teal/75 to-ink",
    label: "Forge",
  },
  {
    id: "ember",
    kind: "gradient",
    gradient: "from-spark-amber via-spark-amber/75 to-ink",
    label: "Ember",
  },
  {
    id: "forest",
    kind: "gradient",
    gradient: "from-forge-teal/70 via-slate-muted/45 to-ink",
    label: "Deep",
  },
  {
    id: "rose",
    kind: "gradient",
    gradient: "from-spark-amber/70 via-forge-teal/55 to-ink",
    label: "Signal",
  },
  {
    id: "midnight",
    kind: "gradient",
    gradient: "from-slate-muted via-ink to-ink",
    label: "Graphite",
  },
  {
    id: "sky",
    kind: "gradient",
    gradient: "from-canvas via-forge-teal/25 to-spark-amber/50",
    label: "Canvas",
  },
] as const satisfies readonly PlanCoverPreset[];

const ALL_PLAN_COVER_PRESETS = [
  ...PLAN_COVER_PRESETS,
  ...LEGACY_PLAN_COVER_PRESETS,
] as const satisfies readonly PlanCoverPreset[];

export type PlanCoverPresetId = (typeof ALL_PLAN_COVER_PRESETS)[number]["id"];
export const PLAN_COVER_PRESET_IDS = ALL_PLAN_COVER_PRESETS.map(
  (preset) => preset.id,
);

export function getPlanCoverPreset(value?: string | null) {
  return ALL_PLAN_COVER_PRESETS.find((preset) => preset.id === value) ?? null;
}
