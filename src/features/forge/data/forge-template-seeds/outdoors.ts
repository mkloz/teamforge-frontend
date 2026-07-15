import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { buildMediaUrl } from "@/shared/lib/media-url";

export const OUTDOORS_TEMPLATES: TemplateSeed[] = [
  {
    id: "walk",
    title: "Easy nature walk",
    description: "Follow an easy route through local green space.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/walk/original.webp",
    ),
    groupName: "Nature Walkers",
    groupDescription: "A group for relaxed walks in parks and the countryside.",
    fixedSize: 5,
    interestHints: ["nature", "walking", "outdoor", "hiking"],
  },
  {
    id: "day-trip",
    title: "Nature reserve visit",
    description: "Spend a day exploring a nearby nature reserve.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/day-trip/original.webp",
    ),
    groupName: "Nature Reserve Explorers",
    groupDescription: "A group for day trips to local nature reserves.",
    fixedSize: 4,
    interestHints: ["nature", "wildlife", "outdoor", "day trip"],
  },
  {
    id: "park-picnic",
    title: "Picnic and park games",
    description: "Bring food and one simple outdoor game that anyone can join.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/park-picnic/original.webp",
    ),
    groupName: "Picnic and Games",
    groupDescription: "A group for shared food and casual games outdoors.",
    fixedSize: 6,
    interestHints: ["picnic", "games", "park", "food"],
  },
  {
    id: "sunset-view",
    title: "Sunset viewpoint visit",
    description:
      "Meet at a local viewpoint before sunset and bring a drink or snack.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/sunset-view/original.webp",
    ),
    groupName: "Sunset Watchers",
    groupDescription: "A group for relaxed evenings at scenic viewpoints.",
    fixedSize: 4,
    interestHints: ["sunset", "views", "nature", "outdoor"],
  },
  {
    id: "beach-day",
    title: "Beach day",
    description:
      "Spend the day by the coast with time for a walk, food, or games.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/beach-day/original.webp",
    ),
    groupName: "Coastal Day Trippers",
    groupDescription: "A group for relaxed days by the coast.",
    fixedSize: 5,
    interestHints: ["beach", "coast", "outdoor", "nature"],
  },
  {
    id: "trail-hike",
    title: "Trail hike",
    description: "Choose a marked trail and hike it at a steady pace.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/trail-hike/original.webp",
    ),
    groupName: "Trail Hikers",
    groupDescription: "A group for day hikes on marked routes.",
    fixedSize: 5,
    interestHints: ["hiking", "outdoor", "nature"],
  },
  {
    id: "botanical-walk",
    title: "Botanical garden visit",
    description: "Walk through a local garden or greenhouse together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/botanical-walk/original.webp",
    ),
    groupName: "Garden Visitors",
    groupDescription:
      "A group for botanical gardens, plants, and outdoor walks.",
    fixedSize: 4,
    interestHints: ["plants", "garden", "nature", "outdoor"],
  },
  {
    id: "outdoor-games",
    title: "Rounders in the park",
    description: "Bring a bat and ball for a casual rounders game.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/outdoor-games/original.webp",
    ),
    groupName: "Park Rounders",
    groupDescription: "A group for friendly rounders games outdoors.",
    fixedSize: 6,
    interestHints: ["rounders", "games", "park", "outdoor"],
  },
  {
    id: "canal-walk",
    title: "Canal walk",
    description: "Follow a flat canal route at an easy pace.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/canal-walk/original.webp",
    ),
    groupName: "Canal Walkers",
    groupDescription: "A group for relaxed walks along local waterways.",
    fixedSize: 5,
    interestHints: ["walk", "outdoor", "nature"],
  },
  {
    id: "nature-sketch",
    title: "Outdoor sketching",
    description:
      "Bring a notebook and draw plants, views, or buildings outside.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/nature-sketch/original.webp",
    ),
    groupName: "Outdoor Sketchers",
    groupDescription: "A group for drawing outdoors at a relaxed pace.",
    fixedSize: 4,
    interestHints: ["sketch", "drawing", "nature", "creative"],
  },
  {
    id: "city-park-loop",
    title: "Brisk park walk",
    description:
      "Follow a brisk loop through a local park, with time to slow down if needed.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/city-park-loop/original.webp",
    ),
    groupName: "City Park Walkers",
    groupDescription: "A group for brisk walks through local parks.",
    fixedSize: 5,
    interestHints: ["park", "walking", "fitness", "outdoor"],
  },
  {
    id: "wild-swim-plan",
    title: "Outdoor swimming",
    description:
      "Choose a safe swimming spot and plan for warm clothes and drinks afterwards.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/wild-swim-plan/original.webp",
    ),
    groupName: "Outdoor Swimmers",
    groupDescription: "A group for carefully planned swims outdoors.",
    fixedSize: 4,
    interestHints: ["swim", "outdoor", "nature", "wellness"],
  },
  {
    id: "sunrise-walk",
    title: "Sunrise walk",
    description: "Meet early and follow a quiet route as the day begins.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/sunrise-walk/original.webp",
    ),
    groupName: "Sunrise Walkers",
    groupDescription: "A group for early-morning walks outdoors.",
    fixedSize: 4,
    interestHints: ["sunrise", "walk", "outdoor", "wellness"],
  },
  {
    id: "campfire-ideas",
    title: "Campfire cookout",
    description: "Cook a simple meal together at a campsite or fire-safe spot.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/campfire-ideas/original.webp",
    ),
    groupName: "Campfire Cookout",
    groupDescription: "A group for outdoor cooking and camping meals.",
    fixedSize: 5,
    interestHints: ["camping", "cooking", "food", "outdoor"],
  },
  {
    id: "birdwatching",
    title: "Birdwatching walk",
    description:
      "Bring binoculars if you have them and look for birds along a quiet route.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/birdwatching/original.webp",
    ),
    groupName: "Birdwatchers",
    groupDescription: "A group for birdwatching walks in local green spaces.",
    fixedSize: 4,
    interestHints: ["birds", "nature", "walk", "outdoor"],
  },
  {
    id: "outdoor-reading",
    title: "Reading in the park",
    description:
      "Bring your own book, read quietly outside, then talk for a few minutes.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/outdoor-reading/original.webp",
    ),
    groupName: "Park Readers",
    groupDescription:
      "A group for quiet reading and short conversations outdoors.",
    fixedSize: 4,
    interestHints: ["reading", "park", "outdoor", "book"],
  },
  {
    id: "bike-and-brunch",
    title: "Bike and brunch",
    description: "Take a short bike ride and finish with brunch together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/bike-and-brunch/original.webp",
    ),
    groupName: "Bike and Brunch",
    groupDescription: "A group for social bike rides with a food stop.",
    fixedSize: 5,
    interestHints: ["bike", "cycling", "brunch", "outdoor"],
  },
  {
    id: "photo-sunset-walk",
    title: "Sunset photography",
    description:
      "Meet before sunset to photograph the changing light and views.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/outdoors/photo-sunset-walk/original.webp",
    ),
    groupName: "Sunset Photographers",
    groupDescription: "A group for outdoor photography around sunset.",
    fixedSize: 4,
    interestHints: ["photography", "sunset", "outdoor", "nature"],
  },
];
