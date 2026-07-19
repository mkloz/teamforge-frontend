import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { buildMediaUrl } from "@/shared/lib/media-url";

export const OTHER_TEMPLATES: TemplateSeed[] = [
  {
    id: "open-plan",
    title: "Group dog walk",
    description: "Meet at a local park and take the dogs on a relaxed walk.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/open-plan/original.webp",
    ),
    groupName: "Local Dog Walkers",
    groupDescription: "A group for dog owners who want regular walks.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["dog walking", "pets", "outdoors"],
  },
  {
    id: "project",
    title: "DIY project day",
    description:
      "Bring a small home repair or furniture project and help each other finish it.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/project/original.webp",
    ),
    groupName: "DIY Helpers",
    groupDescription: "A group for practical home projects and shared tools.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["diy", "home improvement", "repair"],
  },
  {
    id: "volunteer-idea",
    title: "Community garden day",
    description:
      "Spend a few hours planting, weeding, or tending shared garden beds.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/volunteer-idea/original.webp",
    ),
    groupName: "Community Gardeners",
    groupDescription: "A group for helping at local community gardens.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["gardening", "volunteering", "community"],
  },
  {
    id: "swap-session",
    title: "Clothes swap",
    description:
      "Bring clean clothes you no longer wear and exchange them with the group.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/swap-session/original.webp",
    ),
    groupName: "Clothes Swap",
    groupDescription:
      "A group for exchanging good-quality second-hand clothes.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["clothes swap", "second-hand", "sustainability"],
  },
  {
    id: "wildcard",
    title: "Craft market visit",
    description: "Browse makers' stalls and local handmade goods together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/wildcard/original.webp",
    ),
    groupName: "Craft Market Crew",
    groupDescription: "A group for visiting local makers' markets.",
    recommendedMinimumGroupSize: 5,
    recommendedMaximumGroupSize: 8,
    interestHints: ["craft markets", "handmade", "shopping", "local"],
  },
  {
    id: "idea-salon",
    title: "Current affairs discussion",
    description:
      "Choose a recent news topic and discuss it with room for different views.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/idea-salon/original.webp",
    ),
    groupName: "Current Affairs",
    groupDescription: "A group for calm, informed discussion of recent events.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["current affairs", "news", "discussion"],
  },
  {
    id: "local-project",
    title: "Street clean-up",
    description: "Choose a local street and collect litter together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/local-project/original.webp",
    ),
    groupName: "Street Clean-Up Crew",
    groupDescription: "A group for practical clean-up days close to home.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["community", "clean-up", "volunteering"],
  },
  {
    id: "show-and-tell",
    title: "Show-and-tell night",
    description: "Bring an object with a story and take turns sharing it.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/show-and-tell/original.webp",
    ),
    groupName: "Show-and-Tell",
    groupDescription:
      "A group for sharing meaningful objects and their stories.",
    recommendedMinimumGroupSize: 5,
    recommendedMaximumGroupSize: 8,
    interestHints: ["stories", "collecting", "conversation"],
  },
  {
    id: "creative-swap",
    title: "Plant swap",
    description: "Bring spare plants, cuttings, or seeds and trade them.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/creative-swap/original.webp",
    ),
    groupName: "Plant Swap",
    groupDescription: "A group for sharing plants and growing advice.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["plants", "gardening", "swap"],
  },
  {
    id: "micro-volunteering",
    title: "Food bank volunteering",
    description: "Join a food bank shift and help sort or pack donations.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/micro-volunteering/original.webp",
    ),
    groupName: "Food Bank Volunteers",
    groupDescription: "A group for volunteering at local food banks.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["food bank", "volunteering", "community"],
  },
  {
    id: "recommendation-night",
    title: "Podcast club",
    description:
      "Listen to the same podcast episode, then discuss it together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/recommendation-night/original.webp",
    ),
    groupName: "Podcast Club",
    groupDescription: "A group for sharing and discussing podcast episodes.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["podcasts", "discussion", "media"],
  },
  {
    id: "curiosity-table",
    title: "Comedy night",
    description:
      "See a local stand-up show and talk about the best sets afterwards.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/curiosity-table/original.webp",
    ),
    groupName: "Comedy Crowd",
    groupDescription: "A group for going to local stand-up shows.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["comedy", "stand-up", "live shows"],
  },
  {
    id: "local-list",
    title: "Charity shop tour",
    description:
      "Visit local charity shops and look for useful second-hand finds.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/local-list/original.webp",
    ),
    groupName: "Charity Shop Finds",
    groupDescription: "A group for exploring local second-hand shops.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["charity shops", "second-hand", "local"],
  },
  {
    id: "skill-showcase",
    title: "Repair cafe",
    description:
      "Bring a broken household item and work together to repair it.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/skill-showcase/original.webp",
    ),
    groupName: "Repair Cafe",
    groupDescription: "A group for repairing everyday household items.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["repair", "diy", "practical skills"],
  },
  {
    id: "project-kickoff",
    title: "Moving help",
    description: "Help someone pack, carry boxes, or settle into a new place.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/project-kickoff/original.webp",
    ),
    groupName: "Moving Helpers",
    groupDescription: "A group for neighbours helping with house moves.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["moving house", "community", "helping"],
  },
  {
    id: "neighbourhood-notes",
    title: "Neighbourhood access check",
    description:
      "Walk the neighbourhood and note repairs or access problems to report.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/neighbourhood-notes/original.webp",
    ),
    groupName: "Local Access Check",
    groupDescription: "A group for noticing and reporting local issues.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["community", "walking", "accessibility"],
  },
  {
    id: "tiny-challenge",
    title: "Scavenger hunt",
    description: "Follow clues and find items or landmarks around town.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/tiny-challenge/original.webp",
    ),
    groupName: "Scavenger Hunters",
    groupDescription: "A group for local scavenger hunts.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["scavenger hunt", "outdoors", "teamwork"],
  },
  {
    id: "open-table",
    title: "Local event planning",
    description:
      "Choose a small community event and plan the venue, timing, and costs.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/other/open-table/original.webp",
    ),
    groupName: "Local Event Planners",
    groupDescription: "A group for organising small community events.",
    recommendedMinimumGroupSize: 5,
    recommendedMaximumGroupSize: 8,
    interestHints: ["events", "planning", "community"],
  },
];
