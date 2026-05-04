import {
  Cpu,
  Dumbbell,
  Flag,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Mountain,
  Music,
  Palette,
  Plane,
  Sparkles,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import type { ElementType } from "react";

export const ICON_MAP: Record<string, ElementType> = {
  SPORTS: Dumbbell,
  GAMING: Gamepad2,
  SOCIAL: Users,
  ARTS: Palette,
  MUSIC: Music,
  OUTDOORS: Mountain,
  LEARNING: GraduationCap,
  FOOD: UtensilsCrossed,
  TECH: Cpu,
  WELLNESS: HeartPulse,
  TRAVEL: Plane,
  OTHER: Sparkles,
  fallback: Flag,
};
