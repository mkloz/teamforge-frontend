import {
  BookOpen,
  Cpu,
  Gamepad2,
  HeartPulse,
  type LucideIcon,
  Mountain,
  Music,
  Palette,
  Plane,
  Sparkles,
  Trophy,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";
import type { PlanCategory } from "@/shared/schemas/enums";

interface CategoryCover {
  label: string;
  icon: LucideIcon;
  gradient: string;
  accent: "teal" | "amber";
}

const CATEGORY_COVERS: Record<PlanCategory, CategoryCover> = {
  TECH: {
    label: "Tech",
    icon: Cpu,
    gradient: "from-forge-teal/85 via-forge-teal/55 to-ink",
    accent: "teal",
  },
  SPORTS: {
    label: "Sports",
    icon: Trophy,
    gradient: "from-spark-amber/80 via-forge-teal/40 to-ink",
    accent: "amber",
  },
  ARTS: {
    label: "Arts",
    icon: Palette,
    gradient: "from-spark-amber/75 via-forge-teal/35 to-ink",
    accent: "amber",
  },
  SOCIAL: {
    label: "Social",
    icon: UsersRound,
    gradient: "from-forge-teal/75 via-spark-amber/35 to-ink",
    accent: "teal",
  },
  OUTDOORS: {
    label: "Outdoors",
    icon: Mountain,
    gradient: "from-forge-teal/80 via-slate-muted/45 to-ink",
    accent: "teal",
  },
  LEARNING: {
    label: "Learning",
    icon: BookOpen,
    gradient: "from-forge-teal/75 via-forge-teal/40 to-ink",
    accent: "teal",
  },
  MUSIC: {
    label: "Music",
    icon: Music,
    gradient: "from-spark-amber/70 via-forge-teal/45 to-ink",
    accent: "amber",
  },
  FOOD: {
    label: "Food",
    icon: UtensilsCrossed,
    gradient: "from-spark-amber/85 via-spark-amber/45 to-ink",
    accent: "amber",
  },
  GAMING: {
    label: "Gaming",
    icon: Gamepad2,
    gradient: "from-forge-teal/80 via-slate-muted/50 to-ink",
    accent: "teal",
  },
  WELLNESS: {
    label: "Wellness",
    icon: HeartPulse,
    gradient: "from-forge-teal/70 via-spark-amber/30 to-ink",
    accent: "teal",
  },
  TRAVEL: {
    label: "Travel",
    icon: Plane,
    gradient: "from-spark-amber/75 via-forge-teal/45 to-ink",
    accent: "amber",
  },
  OTHER: {
    label: "Gathering",
    icon: Sparkles,
    gradient: "from-forge-teal/70 via-slate-muted/40 to-ink",
    accent: "teal",
  },
};

export function getCategoryCover(category: PlanCategory | null | undefined) {
  if (!category) {
    return CATEGORY_COVERS.OTHER;
  }
  return CATEGORY_COVERS[category];
}
