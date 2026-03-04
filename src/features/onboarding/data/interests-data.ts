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
  /** Lucide icon name (string, resolved at component level) */
  icon: string;
}

export interface InterestCategory {
  id: string;
  label: string;
  description: string;
  color: string; // Tailwind bg class for the category chip accent
  items: InterestItem[];
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    id: "active",
    label: "Active & Outdoors",
    description: "How you move and spend time outside",
    color: "bg-emerald-500",
    items: [
      { id: "hiking", label: "Hiking", icon: "Mountain" },
      { id: "running", label: "Running", icon: "Wind" },
      { id: "cycling", label: "Cycling", icon: "Bike" },
      { id: "gym", label: "Gym & Fitness", icon: "Dumbbell" },
      { id: "yoga", label: "Yoga", icon: "Sparkles" },
      { id: "climbing", label: "Rock Climbing", icon: "Triangle" },
      { id: "swimming", label: "Swimming", icon: "Waves" },
      { id: "martial_arts", label: "Martial Arts", icon: "Shield" },
      { id: "team_sports", label: "Team Sports", icon: "Trophy" },
      { id: "winter_sports", label: "Winter Sports", icon: "CloudSnow" },
      { id: "water_sports", label: "Water Sports", icon: "Anchor" },
      { id: "dance", label: "Dance", icon: "Music" },
    ],
  },
  {
    id: "creative",
    label: "Creative & Arts",
    description: "How you make and express things",
    color: "bg-violet-500",
    items: [
      { id: "music_making", label: "Making Music", icon: "Guitar" },
      { id: "photography", label: "Photography", icon: "Camera" },
      { id: "painting", label: "Painting & Drawing", icon: "Palette" },
      { id: "writing", label: "Writing", icon: "PenLine" },
      { id: "film", label: "Film & Video", icon: "Film" },
      { id: "crafts", label: "DIY & Crafts", icon: "Scissors" },
      { id: "design", label: "Design", icon: "Layers" },
      { id: "fashion", label: "Fashion & Style", icon: "Shirt" },
      { id: "pottery", label: "Pottery & Ceramics", icon: "Circle" },
      { id: "theatre", label: "Theatre & Acting", icon: "Drama" },
      { id: "poetry", label: "Poetry", icon: "BookOpen" },
      { id: "street_art", label: "Street Art", icon: "Spray" },
    ],
  },
  {
    id: "social",
    label: "Social & Lifestyle",
    description: "How you prefer to spend time with others",
    color: "bg-pink-500",
    items: [
      { id: "dining_out", label: "Dining Out", icon: "UtensilsCrossed" },
      { id: "cooking", label: "Cooking & Baking", icon: "ChefHat" },
      { id: "coffee", label: "Coffee Culture", icon: "Coffee" },
      { id: "cocktails", label: "Cocktails & Bars", icon: "GlassWater" },
      { id: "wine", label: "Wine & Tasting", icon: "Wine" },
      { id: "board_games", label: "Board Games", icon: "Gamepad2" },
      { id: "karaoke", label: "Karaoke", icon: "Mic" },
      { id: "nightlife", label: "Nightlife", icon: "Moon" },
      { id: "brunch", label: "Brunch & Cafes", icon: "Sunrise" },
      { id: "volunteering", label: "Volunteering", icon: "Heart" },
      { id: "markets", label: "Markets & Fairs", icon: "ShoppingBag" },
      { id: "escape_rooms", label: "Escape Rooms", icon: "Lock" },
    ],
  },
  {
    id: "mind",
    label: "Mind & Learning",
    description: "How you engage with ideas and knowledge",
    color: "bg-blue-500",
    items: [
      { id: "reading", label: "Reading", icon: "BookOpen" },
      { id: "podcasts", label: "Podcasts", icon: "Headphones" },
      { id: "languages", label: "Learning Languages", icon: "Globe" },
      { id: "science", label: "Science & Discovery", icon: "Microscope" },
      { id: "history", label: "History", icon: "Landmark" },
      { id: "philosophy", label: "Philosophy", icon: "Brain" },
      { id: "documentaries", label: "Documentaries", icon: "Tv" },
      { id: "debate", label: "Debate & Discussion", icon: "MessageSquare" },
      { id: "puzzles", label: "Puzzles & Logic", icon: "Grid" },
      { id: "astronomy", label: "Astronomy", icon: "Star" },
      { id: "economics", label: "Economics", icon: "TrendingUp" },
      { id: "psychology", label: "Psychology", icon: "User" },
    ],
  },
  {
    id: "digital",
    label: "Digital & Gaming",
    description: "How you engage with technology and play",
    color: "bg-cyan-500",
    items: [
      { id: "video_games", label: "Video Games", icon: "Gamepad2" },
      { id: "esports", label: "Esports", icon: "Trophy" },
      { id: "vr", label: "VR & AR", icon: "Glasses" },
      { id: "coding", label: "Coding & Dev", icon: "Code" },
      { id: "anime", label: "Anime & Manga", icon: "Tv" },
      { id: "streaming", label: "Streaming & Content", icon: "Play" },
      { id: "tabletop_rpg", label: "Tabletop RPG", icon: "Map" },
      { id: "crypto", label: "Crypto & Web3", icon: "Cpu" },
      { id: "ai_tech", label: "AI & Emerging Tech", icon: "Bot" },
      { id: "retro_gaming", label: "Retro Gaming", icon: "Joystick" },
      { id: "tech_gadgets", label: "Tech & Gadgets", icon: "Smartphone" },
      { id: "cybersecurity", label: "Cybersecurity", icon: "ShieldCheck" },
    ],
  },
  {
    id: "travel",
    label: "Travel & Exploration",
    description: "How you experience new places",
    color: "bg-orange-500",
    items: [
      { id: "backpacking", label: "Backpacking", icon: "Backpack" },
      { id: "city_breaks", label: "City Breaks", icon: "Building2" },
      { id: "road_trips", label: "Road Trips", icon: "Car" },
      { id: "festivals", label: "Festivals & Events", icon: "PartyPopper" },
      { id: "camping", label: "Camping", icon: "Tent" },
      { id: "luxury_travel", label: "Luxury Travel", icon: "Gem" },
      { id: "solo_travel", label: "Solo Travel", icon: "Compass" },
      { id: "food_tourism", label: "Food Tourism", icon: "UtensilsCrossed" },
      { id: "cultural_tourism", label: "Cultural Tourism", icon: "Landmark" },
      { id: "adventure_travel", label: "Adventure Travel", icon: "Zap" },
      { id: "vanlife", label: "Van Life", icon: "Truck" },
      { id: "local_explorer", label: "Local Explorer", icon: "Map" },
    ],
  },
  {
    id: "lifestyle",
    label: "Lifestyle & Values",
    description: "The daily rhythms and values that shape your life",
    color: "bg-teal-500",
    items: [
      { id: "sustainability", label: "Sustainability", icon: "Leaf" },
      { id: "minimalism", label: "Minimalism", icon: "Minus" },
      { id: "wellness", label: "Wellness & Self-care", icon: "Sparkles" },
      { id: "plant_based", label: "Plant-based Eating", icon: "Salad" },
      { id: "entrepreneurship", label: "Entrepreneurship", icon: "Briefcase" },
      { id: "fitness_lifestyle", label: "Fitness as Lifestyle", icon: "Zap" },
      { id: "mindfulness", label: "Mindfulness", icon: "Circle" },
      { id: "animals_pets", label: "Animals & Pets", icon: "PawPrint" },
      { id: "personal_dev", label: "Personal Development", icon: "TrendingUp" },
      { id: "slow_living", label: "Slow Living", icon: "Sunset" },
      { id: "nightowl", label: "Night Owl", icon: "Moon" },
      { id: "early_bird", label: "Early Bird", icon: "Sunrise" },
    ],
  },
  {
    id: "entertainment",
    label: "Entertainment & Culture",
    description: "The art, music, and culture you consume",
    color: "bg-amber-500",
    items: [
      { id: "live_music", label: "Live Music", icon: "Music" },
      { id: "cinema", label: "Cinema", icon: "Film" },
      { id: "museums", label: "Museums & Galleries", icon: "Landmark" },
      { id: "theatre_shows", label: "Theatre & Shows", icon: "Drama" },
      { id: "comedy", label: "Stand-up Comedy", icon: "Laugh" },
      { id: "sports_watching", label: "Watching Sports", icon: "Trophy" },
      { id: "tv_shows", label: "TV Series", icon: "Tv" },
      { id: "vinyl_records", label: "Vinyl & Records", icon: "Disc" },
      { id: "book_clubs", label: "Book Clubs", icon: "BookOpen" },
      { id: "art_collecting", label: "Art & Collecting", icon: "Frame" },
      { id: "jazz_classical", label: "Jazz & Classical", icon: "Piano" },
      { id: "pop_culture", label: "Pop Culture", icon: "Star" },
    ],
  },
];

/** Minimum number of interests a user must select to continue. */
export const MIN_INTERESTS = 5;

/** Maximum number of interests a user may select. */
export const MAX_INTERESTS = 30;

/** Helper: flat map of all items by id */
export const ALL_INTERESTS_BY_ID: Record<string, InterestItem> =
  INTEREST_CATEGORIES.flatMap((c) => c.items).reduce(
    (acc, item) => ({ ...acc, [item.id]: item }),
    {},
  );
