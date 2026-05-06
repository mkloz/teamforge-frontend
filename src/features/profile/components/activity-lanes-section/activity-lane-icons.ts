import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Coffee,
  Dumbbell,
  Gamepad2,
  Lightbulb,
  Palette,
  Route,
  Sprout,
  Users,
} from "lucide-react";

import type { ActivityLane } from "@/features/profile/lib/profile-insights";

export const activityLaneIcons: Record<ActivityLane["key"], LucideIcon> = {
  builder: Lightbulb,
  creative: Palette,
  food: Coffee,
  general: Sprout,
  learning: BookOpen,
  outdoors: Route,
  play: Gamepad2,
  social: Users,
  wellness: Dumbbell,
};
