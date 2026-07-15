import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { buildMediaUrl } from "@/shared/lib/media-url";

export const TRAVEL_TEMPLATES: TemplateSeed[] = [
  {
    id: "mini-adventure",
    title: "Nearby town day trip",
    description: "Choose a nearby town and spend a few hours exploring it.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/mini-adventure/original.webp",
    ),
    groupName: "Local Day Trippers",
    groupDescription: "A group for short trips to nearby towns.",
    fixedSize: 4,
    interestHints: ["towns", "local", "travel", "day trip"],
  },
  {
    id: "culture-day",
    title: "Historic site visit",
    description:
      "Spend the day visiting a nearby castle, monument, or historic building.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/culture-day/original.webp",
    ),
    groupName: "Historic Site Visitors",
    groupDescription: "A group for day trips to nearby historic places.",
    fixedSize: 5,
    interestHints: ["history", "travel", "culture", "landmarks"],
  },
  {
    id: "neighbourhood-wander",
    title: "Neighbourhood walk",
    description: "Choose an unfamiliar neighbourhood and explore it on foot.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/neighbourhood-wander/original.webp",
    ),
    groupName: "Neighbourhood Explorers",
    groupDescription: "A group for walks through different parts of town.",
    fixedSize: 4,
    interestHints: ["travel", "walk", "culture"],
  },
  {
    id: "road-trip-chat",
    title: "Road trip planning",
    description:
      "Choose a destination, route, stops, and travel times together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/road-trip-chat/original.webp",
    ),
    groupName: "Road Trip Planners",
    groupDescription: "A group for planning practical day trips by car.",
    fixedSize: 5,
    interestHints: ["road trip", "route", "travel", "planning"],
  },
  {
    id: "hidden-gems",
    title: "Independent shops tour",
    description:
      "Visit a few independent shops and cafes in one neighbourhood.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/hidden-gems/original.webp",
    ),
    groupName: "Independent Shop Explorers",
    groupDescription: "A group for visiting independent places around town.",
    fixedSize: 4,
    interestHints: ["shops", "local", "travel", "cafes"],
  },
  {
    id: "photo-route",
    title: "City photo walk",
    description:
      "Follow a city route and take photos of streets, buildings, and details.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/photo-route/original.webp",
    ),
    groupName: "City Photographers",
    groupDescription:
      "A group for photography walks in nearby towns and cities.",
    fixedSize: 4,
    interestHints: ["travel", "photo", "walk"],
  },
  {
    id: "train-day",
    title: "Train day trip",
    description: "Take a train to a nearby stop and spend the day exploring.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/train-day/original.webp",
    ),
    groupName: "Train Travellers",
    groupDescription: "A group for day trips by train.",
    fixedSize: 4,
    interestHints: ["train", "travel", "day trip", "culture"],
  },
  {
    id: "map-and-cafe",
    title: "City cafe crawl",
    description: "Choose a few cafes close together and visit them on foot.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/map-and-cafe/original.webp",
    ),
    groupName: "Cafe Crawlers",
    groupDescription: "A group for exploring a city through its cafes.",
    fixedSize: 4,
    interestHints: ["cafe", "coffee", "city", "travel"],
  },
  {
    id: "passport-planning",
    title: "Weekend trip planning",
    description:
      "Compare destinations, travel costs, places to stay, and dates.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/passport-planning/original.webp",
    ),
    groupName: "Weekend Trip Planners",
    groupDescription: "A group for planning practical weekend trips.",
    fixedSize: 4,
    interestHints: ["travel", "planning", "weekend", "budget"],
  },
  {
    id: "local-landmarks",
    title: "Landmark walking tour",
    description: "Visit a few local landmarks on one walking route.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/local-landmarks/original.webp",
    ),
    groupName: "Local Landmark Walkers",
    groupDescription: "A group for walking tours of nearby landmarks.",
    fixedSize: 5,
    interestHints: ["landmarks", "walking", "travel", "culture"],
  },
  {
    id: "food-map",
    title: "Market food tour",
    description: "Visit a market and try food from a few different stalls.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/food-map/original.webp",
    ),
    groupName: "Market Food Explorers",
    groupDescription: "A group for food markets and city day trips.",
    fixedSize: 5,
    interestHints: ["food", "market", "travel", "culture"],
  },
  {
    id: "budget-trip-table",
    title: "Low-cost day trip",
    description:
      "Choose a nearby destination with affordable fares and spend the day exploring it.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/budget-trip-table/original.webp",
    ),
    groupName: "Budget Travellers",
    groupDescription: "A group for lower-cost day trips.",
    fixedSize: 4,
    interestHints: ["budget", "travel", "day trip", "local"],
  },
  {
    id: "museum-route",
    title: "Museum day",
    description: "Choose one or two museums and spend the day visiting them.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/museum-route/original.webp",
    ),
    groupName: "Museum Visitors",
    groupDescription: "A group for museum visits and nearby cultural stops.",
    fixedSize: 4,
    interestHints: ["museum", "travel", "culture", "art"],
  },
  {
    id: "coastal-idea",
    title: "Seaside town visit",
    description:
      "Take a day trip to a coastal town and explore beyond the beach.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/coastal-idea/original.webp",
    ),
    groupName: "Seaside Travellers",
    groupDescription: "A group for day trips to nearby coastal towns.",
    fixedSize: 5,
    interestHints: ["coast", "beach", "travel", "day trip"],
  },
  {
    id: "city-break-board",
    title: "Overnight city break",
    description: "Choose a nearby city and plan one night away together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/city-break-board/original.webp",
    ),
    groupName: "City Break Travellers",
    groupDescription: "A group for short overnight trips to nearby cities.",
    fixedSize: 4,
    interestHints: ["city", "travel", "weekend", "overnight"],
  },
  {
    id: "travel-photo-share",
    title: "Travel photo swap",
    description:
      "Meet to share travel photos and talk about the places behind them.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/travel-photo-share/original.webp",
    ),
    groupName: "Travel Photo Club",
    groupDescription:
      "A group for sharing travel photos and the stories behind them.",
    fixedSize: 4,
    interestHints: ["photo", "travel", "stories", "culture"],
  },
  {
    id: "hostel-stories",
    title: "Backpacking stories night",
    description: "Meet to swap backpacking stories and practical travel tips.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/hostel-stories/original.webp",
    ),
    groupName: "Backpackers",
    groupDescription:
      "A group for backpacking stories, advice, and future plans.",
    fixedSize: 5,
    interestHints: ["backpacking", "travel", "stories", "tips"],
  },
  {
    id: "map-walk",
    title: "Map-reading city walk",
    description:
      "Take turns following a mapped route through a nearby town or city.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/travel/map-walk/original.webp",
    ),
    groupName: "City Navigators",
    groupDescription: "A group for mapped walks and navigation practice.",
    fixedSize: 4,
    interestHints: ["map", "navigation", "walking", "travel"],
  },
];
