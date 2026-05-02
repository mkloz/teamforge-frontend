import {
  Activity,
  Briefcase,
  Gamepad2,
  GraduationCap,
  HandHeart,
  Heart,
  Mountain,
  Music,
  Palette,
  Scissors,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import type { ElementType } from "react";

export const ICON_MAP: Record<string, ElementType> = {
  sports: Activity,
  gaming: Gamepad2,
  social: Users,
  arts: Palette,
  music: Music,
  outdoors: Mountain,
  learning: GraduationCap,
  food: UtensilsCrossed,
  professional: Briefcase,
  wellness: Heart,
  creative: Scissors,
  community: HandHeart,
};
