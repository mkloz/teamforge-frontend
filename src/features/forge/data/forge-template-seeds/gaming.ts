import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { buildMediaUrl } from "@/shared/lib/media-url";

export const GAMING_TEMPLATES: TemplateSeed[] = [
  {
    id: "party",
    title: "Party game night",
    description:
      "Play a mix of quick games, then choose a longer one together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/party/original.webp",
    ),
    groupName: "Party Game Night",
    groupDescription: "A group for casual multiplayer and board games.",
    fixedSize: 5,
    interestHints: ["party games", "board games", "multiplayer"],
  },
  {
    id: "co-op",
    title: "Online co-op night",
    description:
      "Team up online, use voice chat, and play towards a shared goal.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/co-op/original.webp",
    ),
    groupName: "Online Co-op Night",
    groupDescription: "A group for online co-op games and regular team play.",
    locationType: "ONLINE",
    fixedSize: 4,
    interestHints: ["co-op", "online gaming", "multiplayer"],
  },
  {
    id: "board-game-cafe",
    title: "Board game cafe",
    description: "Choose a game at the cafe and play it through together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/board-game-cafe/original.webp",
    ),
    groupName: "Board Game Cafe",
    groupDescription: "A group for board games at a local cafe.",
    fixedSize: 5,
    interestHints: ["board games", "cafe", "tabletop"],
  },
  {
    id: "retro-arcade",
    title: "Arcade night",
    description: "Meet at an arcade and take turns on classic and new games.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/retro-arcade/original.webp",
    ),
    groupName: "Arcade Night",
    groupDescription:
      "A group for casual arcade games and friendly competition.",
    fixedSize: 4,
    interestHints: ["arcade", "video games", "retro gaming"],
  },
  {
    id: "watch-party",
    title: "Esports watch party",
    description:
      "Watch a live tournament together and talk through the key plays.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/watch-party/original.webp",
    ),
    groupName: "Esports Watch Party",
    groupDescription: "A group for live esports and shared viewing.",
    locationType: "ONLINE",
    fixedSize: 6,
    interestHints: ["esports", "gaming", "watch party"],
  },
  {
    id: "puzzle-room",
    title: "Escape room",
    description: "Book an escape room and solve its clues as a team.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/puzzle-room/original.webp",
    ),
    groupName: "Escape Room Team",
    groupDescription: "A group for escape rooms and team puzzles.",
    fixedSize: 4,
    interestHints: ["escape room", "puzzles", "teamwork"],
  },
  {
    id: "lan-session",
    title: "LAN party",
    description:
      "Bring a computer, choose a multiplayer game, and play in the same room.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/lan-session/original.webp",
    ),
    groupName: "LAN Party",
    groupDescription: "A group for in-person multiplayer PC gaming.",
    fixedSize: 5,
    interestHints: ["lan party", "pc gaming", "multiplayer"],
  },
  {
    id: "rpg-one-shot",
    title: "Tabletop RPG night",
    description: "Play a complete tabletop role-playing story in one evening.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/rpg-one-shot/original.webp",
    ),
    groupName: "Tabletop RPG Players",
    groupDescription: "A group for role-playing games and shared storytelling.",
    fixedSize: 5,
    interestHints: ["tabletop rpg", "role-playing games", "storytelling"],
  },
  {
    id: "chess-cafe",
    title: "Chess meetup",
    description: "Meet for casual chess games and help each other improve.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/chess-cafe/original.webp",
    ),
    groupName: "Chess Meetup",
    groupDescription: "A group for casual chess games and practice.",
    fixedSize: 4,
    interestHints: ["chess", "board games", "strategy"],
  },
  {
    id: "vr-arena",
    title: "VR gaming",
    description: "Book a VR venue and play a few team games together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/vr-arena/original.webp",
    ),
    groupName: "VR Players",
    groupDescription: "A group for multiplayer virtual reality games.",
    fixedSize: 4,
    interestHints: ["virtual reality", "gaming", "multiplayer"],
  },
  {
    id: "strategy-night",
    title: "Strategy game night",
    description: "Choose a longer strategy game and play a full round.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/strategy-night/original.webp",
    ),
    groupName: "Strategy Game Night",
    groupDescription: "A group for longer board games and careful play.",
    fixedSize: 5,
    interestHints: ["strategy games", "board games", "tabletop"],
  },
  {
    id: "controller-swap",
    title: "Console game night",
    description:
      "Bring favourite console games and rotate through short multiplayer rounds.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/controller-swap/original.webp",
    ),
    groupName: "Console Game Night",
    groupDescription: "A group for casual console games and local multiplayer.",
    fixedSize: 5,
    interestHints: ["console gaming", "multiplayer", "party games"],
  },
  {
    id: "game-dev-jam",
    title: "Game design meetup",
    description:
      "Create a simple game idea and turn it into a playable prototype.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/game-dev-jam/original.webp",
    ),
    groupName: "Game Design Meetup",
    groupDescription: "A group for making and testing simple game ideas.",
    fixedSize: 4,
    interestHints: ["game design", "game development", "creative projects"],
  },
  {
    id: "online-raid",
    title: "Online raid night",
    description: "Choose roles, join voice chat, and complete an online raid.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/online-raid/original.webp",
    ),
    groupName: "Online Raiders",
    groupDescription: "A group for organised online raids and team play.",
    locationType: "ONLINE",
    fixedSize: 6,
    interestHints: ["online gaming", "raids", "multiplayer"],
  },
  {
    id: "mystery-board-night",
    title: "Murder mystery game",
    description:
      "Follow clues, question suspects, and solve a mystery together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/mystery-board-night/original.webp",
    ),
    groupName: "Murder Mystery Players",
    groupDescription: "A group for mystery games and social deduction.",
    fixedSize: 6,
    interestHints: ["murder mystery", "social deduction", "party games"],
  },
  {
    id: "speedrun-watch",
    title: "Speedrun watch party",
    description: "Watch a speedrun and discuss the shortcuts and routes.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/speedrun-watch/original.webp",
    ),
    groupName: "Speedrun Watch Party",
    groupDescription: "A group for watching and discussing speedruns.",
    locationType: "ONLINE",
    fixedSize: 5,
    interestHints: ["speedrunning", "gaming", "watch party"],
  },
  {
    id: "card-draft",
    title: "Trading card night",
    description:
      "Bring a card game, build or draft decks, and play a few rounds.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/card-draft/original.webp",
    ),
    groupName: "Trading Card Night",
    groupDescription: "A group for trading card games and casual play.",
    fixedSize: 4,
    interestHints: ["trading cards", "card games", "tabletop"],
  },
  {
    id: "casual-minecraft",
    title: "Build an online world",
    description:
      "Start a shared online world, then build and explore together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/gaming/casual-minecraft/original.webp",
    ),
    groupName: "Shared World Builders",
    groupDescription:
      "A group for building and exploring shared online worlds.",
    locationType: "ONLINE",
    fixedSize: 5,
    interestHints: ["building games", "online gaming", "co-op"],
  },
];
