/**
 * Interest categories for TeamForge onboarding.
 *
 * Design constraints:
 * - No protected characteristics (race, religion, political affiliation,
 *   sexual orientation, health status) used as matching criteria.
 * - Categories focus on activities, lifestyle rhythms, and social preferences —
 *   all of which are legally safe and behaviourally predictive for group fit.
 * - Items are phrased as concrete activities or preferences, never as identity labels.
 */

export interface InterestItem {
  id: string;
  label: string;
  emoji: string;
}

export interface InterestCategory {
  id: string;
  label: string;
  description: string;
  /** Tailwind bg class for the category dot accent */
  color: string;
  items: InterestItem[];
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    id: "active",
    label: "Active & Outdoors",
    description: "How you move and spend time outside",
    color: "bg-emerald-500",
    items: [
      { id: "hiking", label: "Hiking", emoji: "🥾" },
      { id: "running", label: "Running", emoji: "🏃" },
      { id: "cycling", label: "Cycling", emoji: "🚴" },
      { id: "gym", label: "Gym & Fitness", emoji: "🏋️" },
      { id: "yoga", label: "Yoga", emoji: "🧘" },
      { id: "climbing", label: "Rock Climbing", emoji: "🧗" },
      { id: "swimming", label: "Swimming", emoji: "🏊" },
      { id: "martial_arts", label: "Martial Arts", emoji: "🥋" },
      { id: "team_sports", label: "Team Sports", emoji: "⚽" },
      { id: "winter_sports", label: "Winter Sports", emoji: "⛷️" },
      { id: "water_sports", label: "Water Sports", emoji: "🏄" },
      { id: "dance", label: "Dance", emoji: "💃" },
    ],
  },
  {
    id: "creative",
    label: "Creative & Arts",
    description: "How you make and express things",
    color: "bg-violet-500",
    items: [
      { id: "music_making", label: "Making Music", emoji: "🎸" },
      { id: "photography", label: "Photography", emoji: "📷" },
      { id: "painting", label: "Painting & Drawing", emoji: "🎨" },
      { id: "writing", label: "Writing", emoji: "✍️" },
      { id: "film", label: "Film & Video", emoji: "🎬" },
      { id: "crafts", label: "DIY & Crafts", emoji: "✂️" },
      { id: "design", label: "Design", emoji: "🖌️" },
      { id: "fashion", label: "Fashion & Style", emoji: "👗" },
      { id: "pottery", label: "Pottery & Ceramics", emoji: "🏺" },
      { id: "theatre", label: "Theatre & Acting", emoji: "🎭" },
      { id: "poetry", label: "Poetry", emoji: "📖" },
      { id: "street_art", label: "Street Art", emoji: "🖼️" },
    ],
  },
  {
    id: "social",
    label: "Social & Lifestyle",
    description: "How you prefer to spend time with others",
    color: "bg-pink-500",
    items: [
      { id: "dining_out", label: "Dining Out", emoji: "🍽️" },
      { id: "cooking", label: "Cooking & Baking", emoji: "👨‍🍳" },
      { id: "coffee", label: "Coffee Culture", emoji: "☕" },
      { id: "cocktails", label: "Cocktails & Bars", emoji: "🍸" },
      { id: "wine", label: "Wine & Tasting", emoji: "🍷" },
      { id: "board_games", label: "Board Games", emoji: "🎲" },
      { id: "karaoke", label: "Karaoke", emoji: "🎤" },
      { id: "nightlife", label: "Nightlife", emoji: "🌙" },
      { id: "brunch", label: "Brunch & Cafes", emoji: "🥞" },
      { id: "volunteering", label: "Volunteering", emoji: "🤝" },
      { id: "markets", label: "Markets & Fairs", emoji: "🛍️" },
      { id: "escape_rooms", label: "Escape Rooms", emoji: "🔐" },
    ],
  },
  {
    id: "mind",
    label: "Mind & Learning",
    description: "How you engage with ideas and knowledge",
    color: "bg-blue-500",
    items: [
      { id: "reading", label: "Reading", emoji: "📚" },
      { id: "podcasts", label: "Podcasts", emoji: "🎧" },
      { id: "languages", label: "Learning Languages", emoji: "🌍" },
      { id: "science", label: "Science & Discovery", emoji: "🔬" },
      { id: "history", label: "History", emoji: "🏛️" },
      { id: "philosophy", label: "Philosophy", emoji: "🤔" },
      { id: "documentaries", label: "Documentaries", emoji: "🎞️" },
      { id: "debate", label: "Debate & Discussion", emoji: "💬" },
      { id: "puzzles", label: "Puzzles & Logic", emoji: "🧩" },
      { id: "astronomy", label: "Astronomy", emoji: "🔭" },
      { id: "economics", label: "Economics", emoji: "📈" },
      { id: "psychology", label: "Psychology", emoji: "🧠" },
    ],
  },
  {
    id: "digital",
    label: "Digital & Gaming",
    description: "How you engage with technology and play",
    color: "bg-cyan-500",
    items: [
      { id: "video_games", label: "Video Games", emoji: "🎮" },
      { id: "esports", label: "Esports", emoji: "🏆" },
      { id: "vr", label: "VR & AR", emoji: "🥽" },
      { id: "coding", label: "Coding & Dev", emoji: "💻" },
      { id: "anime", label: "Anime & Manga", emoji: "⛩️" },
      { id: "streaming", label: "Streaming & Content", emoji: "📺" },
      { id: "tabletop_rpg", label: "Tabletop RPG", emoji: "🗺️" },
      { id: "crypto", label: "Crypto & Web3", emoji: "🔗" },
      { id: "ai_tech", label: "AI & Emerging Tech", emoji: "🤖" },
      { id: "retro_gaming", label: "Retro Gaming", emoji: "🕹️" },
      { id: "tech_gadgets", label: "Tech & Gadgets", emoji: "📱" },
      { id: "cybersecurity", label: "Cybersecurity", emoji: "🛡️" },
    ],
  },
  {
    id: "travel",
    label: "Travel & Exploration",
    description: "How you experience new places",
    color: "bg-orange-500",
    items: [
      { id: "backpacking", label: "Backpacking", emoji: "🎒" },
      { id: "city_breaks", label: "City Breaks", emoji: "🏙️" },
      { id: "road_trips", label: "Road Trips", emoji: "🚗" },
      { id: "festivals", label: "Festivals & Events", emoji: "🎉" },
      { id: "camping", label: "Camping", emoji: "⛺" },
      { id: "luxury_travel", label: "Luxury Travel", emoji: "✈️" },
      { id: "solo_travel", label: "Solo Travel", emoji: "🧭" },
      { id: "food_tourism", label: "Food Tourism", emoji: "🍜" },
      { id: "cultural_tourism", label: "Cultural Tourism", emoji: "🗿" },
      { id: "adventure_travel", label: "Adventure Travel", emoji: "⚡" },
      { id: "vanlife", label: "Van Life", emoji: "🚐" },
      { id: "local_explorer", label: "Local Explorer", emoji: "🗺️" },
    ],
  },
  {
    id: "lifestyle",
    label: "Lifestyle & Values",
    description: "The daily rhythms and values that shape your life",
    color: "bg-teal-500",
    items: [
      { id: "sustainability", label: "Sustainability", emoji: "🌿" },
      { id: "minimalism", label: "Minimalism", emoji: "⬜" },
      { id: "wellness", label: "Wellness & Self-care", emoji: "🛁" },
      { id: "plant_based", label: "Plant-based Eating", emoji: "🥗" },
      { id: "entrepreneurship", label: "Entrepreneurship", emoji: "💼" },
      { id: "fitness_lifestyle", label: "Fitness as Lifestyle", emoji: "⚡" },
      { id: "mindfulness", label: "Mindfulness", emoji: "🧘" },
      { id: "animals_pets", label: "Animals & Pets", emoji: "🐾" },
      { id: "personal_dev", label: "Personal Development", emoji: "📈" },
      { id: "slow_living", label: "Slow Living", emoji: "🌅" },
      { id: "nightowl", label: "Night Owl", emoji: "🦉" },
      { id: "early_bird", label: "Early Bird", emoji: "🌄" },
    ],
  },
  {
    id: "entertainment",
    label: "Entertainment & Culture",
    description: "The art, music, and culture you consume",
    color: "bg-amber-500",
    items: [
      { id: "live_music", label: "Live Music", emoji: "🎵" },
      { id: "cinema", label: "Cinema", emoji: "🎬" },
      { id: "museums", label: "Museums & Galleries", emoji: "🏛️" },
      { id: "theatre_shows", label: "Theatre & Shows", emoji: "🎭" },
      { id: "comedy", label: "Stand-up Comedy", emoji: "😂" },
      { id: "sports_watching", label: "Watching Sports", emoji: "📺" },
      { id: "tv_shows", label: "TV Series", emoji: "🍿" },
      { id: "vinyl_records", label: "Vinyl & Records", emoji: "💿" },
      { id: "book_clubs", label: "Book Clubs", emoji: "📖" },
      { id: "art_collecting", label: "Art & Collecting", emoji: "🖼️" },
      { id: "jazz_classical", label: "Jazz & Classical", emoji: "🎻" },
      { id: "pop_culture", label: "Pop Culture", emoji: "⭐" },
    ],
  },
];

/** Minimum interests required to continue. */
export const MIN_INTERESTS = 7;

/** Maximum interests a user may select. */
export const MAX_INTERESTS = 30;

/** Flat lookup map by interest id. */
export const ALL_INTERESTS_BY_ID: Record<string, InterestItem> =
  INTEREST_CATEGORIES.flatMap((c) => c.items).reduce(
    (acc, item) => ({ ...acc, [item.id]: item }),
    {},
  );

/**
 * Suggested interest ids seeded by MBTI type.
 * Maps 4-letter types to a starter set of ids that statistically
 * align with that type's typical activity profile.
 * Used on the interests page to surface a "Suggested for you" section.
 */
export const MBTI_SUGGESTIONS: Record<string, string[]> = {
  INTJ: ["reading", "coding", "astronomy", "philosophy", "documentaries", "science", "puzzles"],
  INTP: ["coding", "puzzles", "philosophy", "science", "tabletop_rpg", "astronomy", "ai_tech"],
  ENTJ: ["entrepreneurship", "debate", "economics", "personal_dev", "travel", "city_breaks", "reading"],
  ENTP: ["debate", "entrepreneurship", "podcasts", "ai_tech", "philosophy", "comedy", "travel"],
  INFJ: ["writing", "reading", "psychology", "volunteering", "wellness", "poetry", "mindfulness"],
  INFP: ["writing", "music_making", "poetry", "film", "reading", "photography", "slow_living"],
  ENFJ: ["volunteering", "debate", "book_clubs", "theatre_shows", "cooking", "psychology", "languages"],
  ENFP: ["festivals", "travel", "photography", "dancing", "comedy", "art_collecting", "languages"],
  ISTJ: ["hiking", "history", "board_games", "cooking", "cycling", "economics", "local_explorer"],
  ISFJ: ["cooking", "animals_pets", "volunteering", "board_games", "brunch", "museums", "sustainability"],
  ESTJ: ["team_sports", "entrepreneurship", "board_games", "debate", "road_trips", "economics", "history"],
  ESFJ: ["dining_out", "cooking", "brunch", "volunteering", "markets", "live_music", "board_games"],
  ISTP: ["cycling", "climbing", "martial_arts", "retro_gaming", "coding", "road_trips", "tech_gadgets"],
  ISFP: ["photography", "painting", "hiking", "music_making", "yoga", "slow_living", "animals_pets"],
  ESTP: ["nightlife", "team_sports", "road_trips", "cocktails", "escape_rooms", "water_sports", "video_games"],
  ESFP: ["dance", "karaoke", "festivals", "dining_out", "live_music", "travel", "comedy"],
};
