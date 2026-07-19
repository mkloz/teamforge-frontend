import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { buildMediaUrl } from "@/shared/lib/media-url";

export const WELLNESS_TEMPLATES: TemplateSeed[] = [
  {
    id: "reset",
    title: "Guided relaxation",
    description:
      "Follow a short guided routine with breathing and gentle stretching.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/reset/original.webp",
    ),
    groupName: "Guided Relaxation",
    groupDescription:
      "A group for guided breathing, stretching, and quiet time.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["breathing", "meditation", "wellness", "stretch"],
  },
  {
    id: "walk-talk",
    title: "Wellbeing walk",
    description: "Take an easy walk and talk at a comfortable pace.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/walk-talk/original.webp",
    ),
    groupName: "Wellbeing Walkers",
    groupDescription: "A group for gentle walks and relaxed conversation.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["walk", "wellbeing", "health", "outdoor"],
  },
  {
    id: "yoga-session",
    title: "Beginner yoga",
    description:
      "Book a beginner class or follow a simple yoga routine together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/yoga-session/original.webp",
    ),
    groupName: "Beginner Yoga",
    groupDescription: "A group for beginner-friendly yoga practice.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["yoga", "wellness", "flexibility", "health"],
  },
  {
    id: "mindful-cafe",
    title: "Mindfulness at a cafe",
    description: "Meet at a cafe for a short mindfulness exercise and a chat.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/mindful-cafe/original.webp",
    ),
    groupName: "Mindfulness Cafe",
    groupDescription:
      "A group for simple mindfulness practice and conversation.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["mindful", "meditation", "wellness", "coffee"],
  },
  {
    id: "meal-prep",
    title: "Weekly meal prep",
    description: "Prepare a few simple meals together for the week ahead.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/meal-prep/original.webp",
    ),
    groupName: "Weekly Meal Prep",
    groupDescription: "A group for shared cooking and weekly meal preparation.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["meal prep", "cooking", "food", "health"],
  },
  {
    id: "meditation-reset",
    title: "Guided meditation",
    description: "Follow a short guided meditation, then chat if you want to.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/meditation-reset/original.webp",
    ),
    groupName: "Guided Meditation",
    groupDescription: "A group for guided meditation and quiet reflection.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["meditation", "mindful", "wellness"],
  },
  {
    id: "sleep-routine",
    title: "Sleep routine planning",
    description:
      "Compare evening habits, then write a simple routine to try at home.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/sleep-routine/original.webp",
    ),
    groupName: "Sleep Routine Planners",
    groupDescription: "A group for planning practical evening routines.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["sleep", "wellness", "health", "routine"],
  },
  {
    id: "stretch-break",
    title: "Gentle stretching",
    description: "Follow a gentle stretching routine together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/stretch-break/original.webp",
    ),
    groupName: "Stretching Club",
    groupDescription: "A group for regular stretching and mobility work.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["stretching", "yoga", "mobility", "wellness"],
  },
  {
    id: "breathwork",
    title: "Breathwork class",
    description: "Follow a guided breathing class together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/breathwork/original.webp",
    ),
    groupName: "Breathwork Class",
    groupDescription: "A group for guided breathing exercises.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["breathwork", "breathing", "meditation", "wellness"],
  },
  {
    id: "gentle-hike",
    title: "Walking meditation",
    description:
      "Take a quiet walk while paying attention to breathing and surroundings.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/gentle-hike/original.webp",
    ),
    groupName: "Walking Meditation",
    groupDescription: "A group for quiet, mindful walks outdoors.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["meditation", "walking", "mindful", "outdoor"],
  },
  {
    id: "journaling-cafe",
    title: "Cafe journaling",
    description:
      "Meet at a cafe to write from simple prompts and share only if you want.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/journaling-cafe/original.webp",
    ),
    groupName: "Cafe Journal Club",
    groupDescription: "A group for reflective writing in quiet company.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["journaling", "writing", "coffee", "wellness"],
  },
  {
    id: "pilates-taster",
    title: "Beginner Pilates",
    description: "Book a beginner class and try the movements together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/pilates-taster/original.webp",
    ),
    groupName: "Beginner Pilates",
    groupDescription:
      "A group for beginner Pilates classes and regular practice.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["pilates", "wellness", "fitness", "flexibility"],
  },
  {
    id: "healthy-brunch",
    title: "Balanced brunch cooking",
    description:
      "Cook a simple brunch together with fruit, grains, and protein.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/healthy-brunch/original.webp",
    ),
    groupName: "Brunch Cooks",
    groupDescription: "A group for preparing and sharing balanced brunches.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["brunch", "cooking", "food", "health"],
  },
  {
    id: "digital-detox",
    title: "Phone-free afternoon",
    description:
      "Put phones away for a walk, cafe visit, or quiet activity together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/digital-detox/original.webp",
    ),
    groupName: "Phone-Free Afternoons",
    groupDescription: "A group for spending a few hours away from screens.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["digital detox", "mindful", "wellness", "walk"],
  },
  {
    id: "habit-check-in",
    title: "Plan a weekly habit",
    description:
      "Choose one realistic habit and work out when and how to do it.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/habit-check-in/original.webp",
    ),
    groupName: "Weekly Habit Planners",
    groupDescription: "A group for making simple weekly routines.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["habits", "routine", "wellness", "health"],
  },
  {
    id: "sauna-session",
    title: "Sauna visit",
    description: "Book time at a sauna and relax together afterwards.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/sauna-session/original.webp",
    ),
    groupName: "Sauna Club",
    groupDescription: "A group for sauna visits and quiet conversation.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["sauna", "recovery", "wellness", "health"],
  },
  {
    id: "mindful-photowalk",
    title: "Mindful photo walk",
    description:
      "Walk slowly, notice small details, and take photos along the way.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/mindful-photowalk/original.webp",
    ),
    groupName: "Mindful Photographers",
    groupDescription: "A group for slow photography walks.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["mindful", "photography", "walk", "wellness"],
  },
  {
    id: "park-reset",
    title: "Outdoor tai chi",
    description:
      "Meet in a park and follow a beginner-friendly tai chi routine together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/wellness/park-reset/original.webp",
    ),
    groupName: "Tai Chi Outdoors",
    groupDescription: "A group for tai chi practice in local parks.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["tai chi", "wellness", "outdoor", "movement"],
  },
];
