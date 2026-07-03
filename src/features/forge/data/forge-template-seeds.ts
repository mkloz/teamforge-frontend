import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { ARTS_TEMPLATES } from "@/features/forge/data/forge-template-seeds/arts";
import { FOOD_TEMPLATES } from "@/features/forge/data/forge-template-seeds/food";
import { GAMING_TEMPLATES } from "@/features/forge/data/forge-template-seeds/gaming";
import { LEARNING_TEMPLATES } from "@/features/forge/data/forge-template-seeds/learning";
import { MUSIC_TEMPLATES } from "@/features/forge/data/forge-template-seeds/music";
import { OTHER_TEMPLATES } from "@/features/forge/data/forge-template-seeds/other";
import { OUTDOORS_TEMPLATES } from "@/features/forge/data/forge-template-seeds/outdoors";
import { SOCIAL_TEMPLATES } from "@/features/forge/data/forge-template-seeds/social";
import { SPORTS_TEMPLATES } from "@/features/forge/data/forge-template-seeds/sports";
import { TECH_TEMPLATES } from "@/features/forge/data/forge-template-seeds/tech";
import { TRAVEL_TEMPLATES } from "@/features/forge/data/forge-template-seeds/travel";
import { WELLNESS_TEMPLATES } from "@/features/forge/data/forge-template-seeds/wellness";

export const CATEGORY_TEMPLATES: Record<string, TemplateSeed[]> = {
  SPORTS: SPORTS_TEMPLATES,
  GAMING: GAMING_TEMPLATES,
  SOCIAL: SOCIAL_TEMPLATES,
  ARTS: ARTS_TEMPLATES,
  MUSIC: MUSIC_TEMPLATES,
  OUTDOORS: OUTDOORS_TEMPLATES,
  LEARNING: LEARNING_TEMPLATES,
  FOOD: FOOD_TEMPLATES,
  TECH: TECH_TEMPLATES,
  WELLNESS: WELLNESS_TEMPLATES,
  TRAVEL: TRAVEL_TEMPLATES,
  OTHER: OTHER_TEMPLATES,
};
