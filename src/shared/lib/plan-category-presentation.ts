import {
  BookOpen,
  Cpu,
  Gamepad2,
  Handshake,
  HeartPulse,
  type LucideIcon,
  Mountain,
  Music,
  Palette,
  Plane,
  Trophy,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";

import type { PlanCategory } from "@/shared/schemas/enums";

interface PlanCategoryPresentation {
  accent: "amber" | "teal";
  gradient: string;
  icon: LucideIcon;
  label: string;
}

const CATEGORY_PRESENTATIONS: Record<PlanCategory, PlanCategoryPresentation> = {
  ARTS: {
    accent: "amber",
    gradient: "from-spark-amber/75 via-forge-teal/35 to-ink",
    icon: Palette,
    label: "Arts",
  },
  FOOD: {
    accent: "amber",
    gradient: "from-spark-amber/85 via-spark-amber/45 to-ink",
    icon: UtensilsCrossed,
    label: "Food",
  },
  GAMING: {
    accent: "teal",
    gradient: "from-forge-teal/80 via-slate-muted/50 to-ink",
    icon: Gamepad2,
    label: "Gaming",
  },
  LEARNING: {
    accent: "teal",
    gradient: "from-forge-teal/75 via-forge-teal/40 to-ink",
    icon: BookOpen,
    label: "Learning",
  },
  MUSIC: {
    accent: "amber",
    gradient: "from-spark-amber/70 via-forge-teal/45 to-ink",
    icon: Music,
    label: "Music",
  },
  OTHER: {
    accent: "teal",
    gradient: "from-forge-teal/70 via-slate-muted/40 to-ink",
    icon: Handshake,
    label: "Gathering",
  },
  OUTDOORS: {
    accent: "teal",
    gradient: "from-forge-teal/80 via-slate-muted/45 to-ink",
    icon: Mountain,
    label: "Outdoors",
  },
  SOCIAL: {
    accent: "teal",
    gradient: "from-forge-teal/75 via-spark-amber/35 to-ink",
    icon: UsersRound,
    label: "Social",
  },
  SPORTS: {
    accent: "amber",
    gradient: "from-spark-amber/80 via-forge-teal/40 to-ink",
    icon: Trophy,
    label: "Sports",
  },
  TECH: {
    accent: "teal",
    gradient: "from-forge-teal/85 via-forge-teal/55 to-ink",
    icon: Cpu,
    label: "Tech",
  },
  TRAVEL: {
    accent: "amber",
    gradient: "from-spark-amber/75 via-forge-teal/45 to-ink",
    icon: Plane,
    label: "Travel",
  },
  WELLNESS: {
    accent: "teal",
    gradient: "from-forge-teal/70 via-spark-amber/30 to-ink",
    icon: HeartPulse,
    label: "Wellness",
  },
};

export function getPlanCategoryPresentation(
  category: PlanCategory | null | undefined,
) {
  return CATEGORY_PRESENTATIONS[category ?? "OTHER"];
}
