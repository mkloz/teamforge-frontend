import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { buildMediaUrl } from "@/shared/lib/media-url";

export const ARTS_TEMPLATES: TemplateSeed[] = [
  {
    id: "gallery",
    title: "Gallery visit",
    description: "Browse an exhibition together and discuss what stood out.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/gallery/original.webp",
    ),
    groupName: "Gallery Visitors",
    groupDescription: "A group for visiting galleries and discussing the art.",
    fixedSize: 4,
    interestHints: ["art", "museum", "gallery", "culture"],
  },
  {
    id: "creative",
    title: "Art workshop",
    description: "Bring supplies and work on a drawing, painting, or craft.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/creative/original.webp",
    ),
    groupName: "Art Workshop",
    groupDescription: "A group for making art and sharing practical advice.",
    fixedSize: 5,
    interestHints: ["art", "painting", "drawing", "craft"],
  },
  {
    id: "cinema-chat",
    title: "Cinema night",
    description: "Watch a film at the cinema and talk about it afterwards.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/cinema-chat/original.webp",
    ),
    groupName: "Cinema Club",
    groupDescription: "A group for cinema trips and post-film discussion.",
    fixedSize: 4,
    interestHints: ["cinema", "film", "art"],
  },
  {
    id: "photo-walk",
    title: "Photo walk",
    description: "Walk a local route and take photos along the way.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/photo-walk/original.webp",
    ),
    groupName: "Photo Walkers",
    groupDescription: "A group for taking photos on local walks.",
    fixedSize: 5,
    interestHints: ["photo", "creative", "design"],
  },
  {
    id: "life-drawing",
    title: "Life drawing class",
    description: "Join a guided figure-drawing class and practise sketching.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/life-drawing/original.webp",
    ),
    groupName: "Life Drawing Club",
    groupDescription: "A group for attending life drawing classes together.",
    fixedSize: 4,
    interestHints: ["life drawing", "drawing", "sketching", "art"],
  },
  {
    id: "street-art-walk",
    title: "Street art tour",
    description: "Walk around the city to find murals and public art.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/street-art-walk/original.webp",
    ),
    groupName: "Street Art Tour",
    groupDescription: "A group for exploring murals and public art on foot.",
    fixedSize: 5,
    interestHints: ["street art", "public art", "walking", "photography"],
  },
  {
    id: "pottery-session",
    title: "Pottery class",
    description: "Try wheel throwing or hand-building in a beginner class.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/pottery-session/original.webp",
    ),
    groupName: "Pottery Club",
    groupDescription: "A group for taking pottery classes together.",
    fixedSize: 4,
    interestHints: ["pottery", "ceramics", "clay", "art"],
  },
  {
    id: "theatre-night",
    title: "Theatre night",
    description: "See a play or musical and talk about it afterwards.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/theatre-night/original.webp",
    ),
    groupName: "Theatre Club",
    groupDescription: "A group for attending plays and musicals together.",
    fixedSize: 4,
    interestHints: ["theatre", "performance", "culture", "art"],
  },
  {
    id: "collage-night",
    title: "Collage workshop",
    description: "Bring paper and images to make collages together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/collage-night/original.webp",
    ),
    groupName: "Collage Makers",
    groupDescription: "A group for making and sharing paper collages.",
    fixedSize: 5,
    interestHints: ["collage", "paper craft", "design", "art"],
  },
  {
    id: "zine-workshop",
    title: "Make a mini magazine",
    description: "Write, draw, and assemble a small handmade magazine.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/zine-workshop/original.webp",
    ),
    groupName: "Mini Magazine Makers",
    groupDescription: "A group for creating small handmade magazines.",
    fixedSize: 5,
    interestHints: ["writing", "illustration", "design", "paper craft"],
  },
  {
    id: "architecture-walk",
    title: "Architecture tour",
    description: "Walk through a neighbourhood and examine its buildings.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/architecture-walk/original.webp",
    ),
    groupName: "Architecture Tour",
    groupDescription: "A group for exploring local buildings and design.",
    fixedSize: 5,
    interestHints: ["architecture", "design", "walking", "history"],
  },
  {
    id: "craft-cafe",
    title: "Craft cafe meetup",
    description:
      "Bring knitting, crochet, or another portable craft to a cafe.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/craft-cafe/original.webp",
    ),
    groupName: "Cafe Crafters",
    groupDescription: "A group for working on portable crafts at a cafe.",
    fixedSize: 4,
    interestHints: ["craft", "knitting", "crochet", "coffee"],
  },
  {
    id: "film-club",
    title: "Film club",
    description: "Choose a film to watch and discuss it as a group.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/film-club/original.webp",
    ),
    groupName: "Film Club",
    groupDescription: "A group for regular film screenings and discussion.",
    fixedSize: 5,
    interestHints: ["film", "cinema", "art", "culture"],
  },
  {
    id: "poetry-open-mic",
    title: "Poetry open mic",
    description: "Attend a poetry night to listen or read your own work.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/poetry-open-mic/original.webp",
    ),
    groupName: "Poetry Open Mic Crew",
    groupDescription: "A group for attending and performing at poetry nights.",
    fixedSize: 4,
    interestHints: ["poetry", "performance", "writing", "art"],
  },
  {
    id: "design-critique",
    title: "Art and design critique",
    description:
      "Bring a piece of art or design work and exchange specific feedback.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/design-critique/original.webp",
    ),
    groupName: "Creative Critique",
    groupDescription:
      "A group for discussing work in progress and giving useful feedback.",
    fixedSize: 4,
    interestHints: ["design", "art", "portfolio", "feedback"],
  },
  {
    id: "printmaking-session",
    title: "Printmaking class",
    description: "Learn a simple printing technique with stamps or lino.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/printmaking-session/original.webp",
    ),
    groupName: "Printmaking Club",
    groupDescription: "A group for learning and practising printmaking.",
    fixedSize: 4,
    interestHints: ["printmaking", "lino", "printing", "art"],
  },
  {
    id: "museum-late",
    title: "Evening museum visit",
    description: "Visit a museum after hours and explore the exhibitions.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/museum-late/original.webp",
    ),
    groupName: "Museum Evening Crew",
    groupDescription: "A group for after-hours museum visits.",
    fixedSize: 5,
    interestHints: ["museum", "gallery", "culture", "art"],
  },
  {
    id: "sculpture-garden",
    title: "Sculpture park visit",
    description: "Walk through an outdoor sculpture park and view the art.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/sculpture-garden/original.webp",
    ),
    groupName: "Sculpture Park Visit",
    groupDescription: "A group for exploring outdoor sculpture parks.",
    fixedSize: 4,
    interestHints: ["sculpture", "public art", "walking", "outdoors"],
  },
];
