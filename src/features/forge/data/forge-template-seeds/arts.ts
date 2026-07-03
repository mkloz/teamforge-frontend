import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { buildMediaUrl } from "@/shared/lib/media-url";

export const ARTS_TEMPLATES: TemplateSeed[] = [
  {
    id: "gallery",
    title: "Gallery slow-look",
    description: "Browse at an easy pace and compare what stuck.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/gallery/original.webp",
    ),
    groupName: "Culture Crew",
    groupDescription: "A group for museums, galleries, and arts plans.",
    fixedSize: 4,
    interestHints: ["art", "museum", "gallery", "culture"],
  },
  {
    id: "creative",
    title: "Making session",
    description:
      "Bring a small creative task and leave with something started.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/creative/original.webp",
    ),
    groupName: "Creative Table",
    groupDescription: "A hands-on group for making and sharing ideas.",
    fixedSize: 5,
    interestHints: ["creative", "painting", "photo", "design"],
  },
  {
    id: "cinema-chat",
    title: "Film and notes",
    description: "Watch something interesting, then talk through the choices.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/cinema-chat/original.webp",
    ),
    groupName: "Cinema Circle",
    groupDescription: "A group for films, reactions, and thoughtful chat.",
    fixedSize: 4,
    interestHints: ["cinema", "film", "art"],
  },
  {
    id: "photo-walk",
    title: "Photo walk",
    description: "Follow a route and notice details worth framing.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/photo-walk/original.webp",
    ),
    groupName: "Photo Walkers",
    groupDescription: "A group for photography walks and creative practice.",
    fixedSize: 5,
    interestHints: ["photo", "creative", "design"],
  },
  {
    id: "life-drawing",
    title: "Life drawing",
    description:
      "A calm sketching slot where practice matters more than polish.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/life-drawing/original.webp",
    ),
    groupName: "Drawing Table",
    groupDescription: "A group for sketching, practice, and creative focus.",
    fixedSize: 4,
    interestHints: ["drawing", "painting", "art"],
  },
  {
    id: "street-art-walk",
    title: "Street art route",
    description: "Find murals, public art, and strange corners worth noticing.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/street-art-walk/original.webp",
    ),
    groupName: "Street Art Walk",
    groupDescription: "A group for public art, photography, and wandering.",
    fixedSize: 5,
    interestHints: ["art", "photo", "culture"],
  },
  {
    id: "pottery-session",
    title: "Pottery taster",
    description: "Book a wheel or hand-building class and get messy.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/pottery-session/original.webp",
    ),
    groupName: "Clay Table",
    groupDescription: "A group for hands-on art and slow creative focus.",
    fixedSize: 4,
    interestHints: ["pottery", "creative", "art", "workshop"],
  },
  {
    id: "theatre-night",
    title: "Theatre night",
    description: "See a show, then compare notes while it is still fresh.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/theatre-night/original.webp",
    ),
    groupName: "Theatre Circle",
    groupDescription: "A group for performance, culture, and good discussion.",
    fixedSize: 4,
    interestHints: ["theatre", "performance", "culture", "art"],
  },
  {
    id: "collage-night",
    title: "Collage table",
    description: "Bring scraps, images, and one loose theme to build from.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/collage-night/original.webp",
    ),
    groupName: "Collage Night",
    groupDescription: "A group for hands-on art and easy creative flow.",
    fixedSize: 5,
    interestHints: ["collage", "creative", "art"],
  },
  {
    id: "zine-workshop",
    title: "Zine workshop",
    description: "Turn rough ideas into a tiny publication in one sitting.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/zine-workshop/original.webp",
    ),
    groupName: "Zine Workshop",
    groupDescription: "A group for small publications and creative sharing.",
    fixedSize: 5,
    interestHints: ["zine", "creative", "design", "art"],
  },
  {
    id: "architecture-walk",
    title: "Architecture walk",
    description: "Look up, compare details, and let the route lead.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/architecture-walk/original.webp",
    ),
    groupName: "Architecture Walk",
    groupDescription: "A group for buildings, design, and visual exploring.",
    fixedSize: 5,
    interestHints: ["architecture", "design", "walk", "culture"],
  },
  {
    id: "craft-cafe",
    title: "Craft cafe",
    description: "Bring a portable project and make progress beside people.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/craft-cafe/original.webp",
    ),
    groupName: "Craft Cafe",
    groupDescription: "A group for portable crafts and relaxed making.",
    fixedSize: 4,
    interestHints: ["craft", "creative", "coffee"],
  },
  {
    id: "film-club",
    title: "Film club",
    description: "Pick one film and give the discussion proper room.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/film-club/original.webp",
    ),
    groupName: "Film Club",
    groupDescription: "A group for cinema, reactions, and good discussion.",
    fixedSize: 5,
    interestHints: ["film", "cinema", "art", "culture"],
  },
  {
    id: "poetry-open-mic",
    title: "Poetry open mic",
    description: "Go to listen, read, or support people trying things aloud.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/poetry-open-mic/original.webp",
    ),
    groupName: "Poetry Table",
    groupDescription: "A group for spoken word, writing, and performance.",
    fixedSize: 4,
    interestHints: ["poetry", "performance", "writing", "art"],
  },
  {
    id: "design-critique",
    title: "Design critique",
    description:
      "Bring work and trade feedback that is useful, not performative.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/design-critique/original.webp",
    ),
    groupName: "Design Critique",
    groupDescription: "A group for creative feedback and sharper ideas.",
    fixedSize: 4,
    interestHints: ["design", "creative", "feedback"],
  },
  {
    id: "printmaking-session",
    title: "Printmaking taster",
    description: "Try stamps, lino, or simple prints without overplanning it.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/printmaking-session/original.webp",
    ),
    groupName: "Printmaking Session",
    groupDescription: "A group for hands-on art and practical experiments.",
    fixedSize: 4,
    interestHints: ["printmaking", "art", "creative", "workshop"],
  },
  {
    id: "museum-late",
    title: "Museum late",
    description: "Evening galleries with enough time to talk afterwards.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/museum-late/original.webp",
    ),
    groupName: "Museum Late",
    groupDescription: "A group for evening culture and gallery wandering.",
    fixedSize: 5,
    interestHints: ["museum", "gallery", "culture", "art"],
  },
  {
    id: "sculpture-garden",
    title: "Sculpture garden",
    description: "Outdoor art, slow looking, and a route that stays relaxed.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/arts/sculpture-garden/original.webp",
    ),
    groupName: "Sculpture Garden",
    groupDescription: "A group for public art and gentle exploring.",
    fixedSize: 4,
    interestHints: ["sculpture", "art", "outdoor", "culture"],
  },
];
