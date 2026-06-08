import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Beer,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Circle,
  Coffee,
  Dog,
  Dumbbell,
  Gamepad2,
  Hammer,
  Headphones,
  Heart,
  Laptop,
  Music,
  Palette,
  Pizza,
  Plane,
  Popcorn,
  Scale,
  Scissors,
  Sofa,
  Stethoscope,
  Tent,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

import type { Interest } from "@/shared/schemas";

export const interestIconByName: Record<string, LucideIcon> = {
  Activity,
  Beer,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Circle,
  Coffee,
  Dog,
  Dumbbell,
  Gamepad2,
  Hammer,
  Headphones,
  Heart,
  Laptop,
  Music,
  Palette,
  Pizza,
  Plane,
  Popcorn,
  Scale,
  Scissors,
  Sofa,
  Stethoscope,
  Tent,
  TrendingUp,
  Trophy,
  Users,
};

export const interestIconByTaxonomyId: Record<string, LucideIcon> = {
  careers: BriefcaseBusiness,
  healthcare: Stethoscope,
  education: BookOpen,
  trades: Hammer,
  business: TrendingUp,
  public_service: Scale,
  tech_science: Laptop,
  service_hospitality: Coffee,
  media_arts: Palette,
  lifestyle: Heart,
  pets: Dog,
  food_drink: Pizza,
  home_decor: Sofa,
  travel: Plane,
  life_values: Users,
  entertainment: Popcorn,
  music_tv: Headphones,
  gaming: Gamepad2,
  social: Beer,
  sports_outdoors: Dumbbell,
  fitness_sport: Dumbbell,
  outdoors: Tent,
  wellness: Heart,
  hobbies_creating: Palette,
  visual_arts: Scissors,
  music_performance: Music,
  tech_science_play: Brain,
  general: Activity,
  movies_tv: Popcorn,
  books_learning: BookOpen,
  team_sports: Trophy,
};

export function getInterestIcon(interest: Interest): LucideIcon {
  if (interest.icon && interestIconByName[interest.icon]) {
    return interestIconByName[interest.icon];
  }

  return (
    interestIconByTaxonomyId[interest.id] ??
    interestIconByTaxonomyId[interest.slug] ??
    (interest.parentId ? interestIconByTaxonomyId[interest.parentId] : null) ??
    (interest.parent?.id
      ? interestIconByTaxonomyId[interest.parent.id]
      : null) ??
    (interest.parent?.slug
      ? interestIconByTaxonomyId[interest.parent.slug]
      : null) ??
    Circle
  );
}
