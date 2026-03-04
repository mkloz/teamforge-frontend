/**
 * Hierarchical interests data for TeamForge onboarding.
 *
 * Structure mirrors the dissertation's Interest model:
 *   L1 (Category) → L2 (Subcategory) → L3 (Leaf Tag)
 *
 * Only L3 leaf tags are stored as UserInterest records in the DB
 * and form the dimensions of the cosine-similarity interest vector V_I.
 *
 * Legal constraint: no protected characteristics (ethnicity, religion,
 * sexual orientation, political affiliation, disability status) appear as
 * tags. All items describe activities, preferences, and lifestyle choices.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeafTag {
  id: string;
  label: string;
}

export interface Subcategory {
  id: string;
  label: string;
  emoji: string;
  tags: LeafTag[];
}

export interface Category {
  id: string;
  label: string;
  description: string;
  /** Tailwind bg class for the accent dot */
  color: string;
  subcategories: Subcategory[];
}

// ─── Hierarchy ────────────────────────────────────────────────────────────────

export const INTEREST_CATEGORIES: Category[] = [
  {
    id: "sport",
    label: "Sport & Fitness",
    description: "How you move your body",
    color: "bg-emerald-500",
    subcategories: [
      {
        id: "team_sports",
        label: "Team Sports",
        emoji: "⚽",
        tags: [
          { id: "football", label: "Football" },
          { id: "basketball", label: "Basketball" },
          { id: "volleyball", label: "Volleyball" },
          { id: "hockey", label: "Hockey" },
          { id: "rugby", label: "Rugby" },
          { id: "baseball", label: "Baseball" },
        ],
      },
      {
        id: "individual_sports",
        label: "Individual Sports",
        emoji: "🎾",
        tags: [
          { id: "tennis", label: "Tennis" },
          { id: "badminton", label: "Badminton" },
          { id: "table_tennis", label: "Table Tennis" },
          { id: "boxing", label: "Boxing" },
          { id: "wrestling", label: "Wrestling" },
          { id: "golf", label: "Golf" },
        ],
      },
      {
        id: "endurance",
        label: "Endurance",
        emoji: "🏃",
        tags: [
          { id: "running", label: "Running" },
          { id: "marathon", label: "Marathon" },
          { id: "cycling", label: "Cycling" },
          { id: "triathlon", label: "Triathlon" },
          { id: "swimming_sport", label: "Swimming" },
          { id: "rowing", label: "Rowing" },
        ],
      },
      {
        id: "fitness",
        label: "Fitness & Gym",
        emoji: "🏋️",
        tags: [
          { id: "weightlifting", label: "Weightlifting" },
          { id: "crossfit", label: "CrossFit" },
          { id: "calisthenics", label: "Calisthenics" },
          { id: "pilates", label: "Pilates" },
          { id: "yoga_fitness", label: "Yoga" },
          { id: "functional_training", label: "Functional Training" },
        ],
      },
      {
        id: "outdoor_sport",
        label: "Outdoor & Adventure",
        emoji: "🧗",
        tags: [
          { id: "hiking", label: "Hiking" },
          { id: "rock_climbing", label: "Rock Climbing" },
          { id: "mountain_biking", label: "Mountain Biking" },
          { id: "skiing", label: "Skiing" },
          { id: "snowboarding", label: "Snowboarding" },
          { id: "surfing", label: "Surfing" },
          { id: "kitesurfing", label: "Kitesurfing" },
        ],
      },
      {
        id: "martial_arts",
        label: "Martial Arts",
        emoji: "🥋",
        tags: [
          { id: "mma", label: "MMA" },
          { id: "judo", label: "Judo" },
          { id: "karate", label: "Karate" },
          { id: "bjj", label: "Brazilian Jiu-Jitsu" },
          { id: "muay_thai", label: "Muay Thai" },
          { id: "taekwondo", label: "Taekwondo" },
        ],
      },
    ],
  },
  {
    id: "arts",
    label: "Arts & Creativity",
    description: "How you make and express things",
    color: "bg-violet-500",
    subcategories: [
      {
        id: "visual_arts",
        label: "Visual Arts",
        emoji: "🎨",
        tags: [
          { id: "painting", label: "Painting" },
          { id: "drawing", label: "Drawing" },
          { id: "sculpture", label: "Sculpture" },
          { id: "illustration", label: "Illustration" },
          { id: "street_art", label: "Street Art / Graffiti" },
          { id: "printmaking", label: "Printmaking" },
        ],
      },
      {
        id: "music",
        label: "Music",
        emoji: "🎸",
        tags: [
          { id: "guitar", label: "Guitar" },
          { id: "piano", label: "Piano / Keyboard" },
          { id: "drums", label: "Drums" },
          { id: "singing", label: "Singing" },
          { id: "dj", label: "DJing" },
          { id: "music_production", label: "Music Production" },
          { id: "bass", label: "Bass" },
        ],
      },
      {
        id: "performing_arts",
        label: "Performing Arts",
        emoji: "🎭",
        tags: [
          { id: "theatre_acting", label: "Acting" },
          { id: "improv", label: "Improv Comedy" },
          { id: "stand_up", label: "Stand-up Comedy" },
          { id: "dance_performance", label: "Dance" },
          { id: "spoken_word", label: "Spoken Word / Poetry" },
          { id: "circus_arts", label: "Circus Arts" },
        ],
      },
      {
        id: "crafts_making",
        label: "Crafts & Making",
        emoji: "✂️",
        tags: [
          { id: "pottery", label: "Pottery & Ceramics" },
          { id: "woodworking", label: "Woodworking" },
          { id: "sewing", label: "Sewing & Textiles" },
          { id: "jewellery", label: "Jewellery Making" },
          { id: "leathercraft", label: "Leathercraft" },
          { id: "candle_making", label: "Candle & Soap Making" },
        ],
      },
      {
        id: "digital_arts",
        label: "Digital & Design",
        emoji: "🖌️",
        tags: [
          { id: "graphic_design", label: "Graphic Design" },
          { id: "ui_ux_design", label: "UI/UX Design" },
          { id: "3d_modeling", label: "3D Modeling" },
          { id: "digital_illustration", label: "Digital Illustration" },
          { id: "motion_graphics", label: "Motion Graphics" },
          { id: "photo_editing", label: "Photo Editing" },
        ],
      },
      {
        id: "writing_arts",
        label: "Writing",
        emoji: "✍️",
        tags: [
          { id: "fiction_writing", label: "Fiction" },
          { id: "screenwriting", label: "Screenwriting" },
          { id: "journalism", label: "Journalism" },
          { id: "blogging", label: "Blogging" },
          { id: "poetry_writing", label: "Poetry" },
          { id: "copywriting", label: "Copywriting" },
        ],
      },
    ],
  },
  {
    id: "technology",
    label: "Technology & Science",
    description: "How you engage with ideas and systems",
    color: "bg-cyan-500",
    subcategories: [
      {
        id: "software_dev",
        label: "Software Development",
        emoji: "💻",
        tags: [
          { id: "web_dev", label: "Web Development" },
          { id: "mobile_dev", label: "Mobile Development" },
          { id: "backend_dev", label: "Backend / APIs" },
          { id: "devops", label: "DevOps & Cloud" },
          { id: "open_source", label: "Open Source" },
          { id: "game_dev", label: "Game Development" },
        ],
      },
      {
        id: "emerging_tech",
        label: "Emerging Tech",
        emoji: "🤖",
        tags: [
          { id: "ai_ml", label: "AI & Machine Learning" },
          { id: "blockchain", label: "Blockchain & Web3" },
          { id: "vr_ar", label: "VR & AR" },
          { id: "robotics", label: "Robotics" },
          { id: "iot", label: "IoT & Hardware" },
          { id: "cybersecurity_tech", label: "Cybersecurity" },
        ],
      },
      {
        id: "sciences",
        label: "Science",
        emoji: "🔬",
        tags: [
          { id: "physics", label: "Physics" },
          { id: "biology", label: "Biology" },
          { id: "chemistry", label: "Chemistry" },
          { id: "astronomy_science", label: "Astronomy" },
          { id: "neuroscience", label: "Neuroscience" },
          { id: "environmental_science", label: "Environmental Science" },
        ],
      },
      {
        id: "gaming",
        label: "Gaming",
        emoji: "🎮",
        tags: [
          { id: "pc_gaming", label: "PC Gaming" },
          { id: "console_gaming", label: "Console Gaming" },
          { id: "mobile_gaming", label: "Mobile Gaming" },
          { id: "esports_playing", label: "Esports" },
          { id: "tabletop_rpg_games", label: "Tabletop RPG" },
          { id: "retro_games", label: "Retro Gaming" },
        ],
      },
    ],
  },
  {
    id: "social",
    label: "Social & Food",
    description: "How you spend time with others",
    color: "bg-pink-500",
    subcategories: [
      {
        id: "food_drink",
        label: "Food & Drink",
        emoji: "🍽️",
        tags: [
          { id: "cooking_home", label: "Cooking at Home" },
          { id: "baking", label: "Baking" },
          { id: "dining_restaurants", label: "Restaurant Dining" },
          { id: "wine_tasting", label: "Wine Tasting" },
          { id: "cocktail_craft", label: "Cocktail Making" },
          { id: "coffee_specialty", label: "Specialty Coffee" },
          { id: "food_tourism_local", label: "Street Food & Markets" },
        ],
      },
      {
        id: "nightlife_social",
        label: "Nightlife & Events",
        emoji: "🌙",
        tags: [
          { id: "clubbing", label: "Clubbing" },
          { id: "bar_hopping", label: "Bar Hopping" },
          { id: "live_concerts", label: "Live Concerts" },
          { id: "festival_going", label: "Festival Going" },
          { id: "karaoke_social", label: "Karaoke" },
          { id: "comedy_shows", label: "Comedy Shows" },
        ],
      },
      {
        id: "games_social",
        label: "Games & Play",
        emoji: "🎲",
        tags: [
          { id: "board_games_social", label: "Board Games" },
          { id: "card_games", label: "Card Games" },
          { id: "escape_rooms_social", label: "Escape Rooms" },
          { id: "quiz_trivia", label: "Pub Quiz / Trivia" },
          { id: "pool_darts", label: "Pool & Darts" },
          { id: "bowling", label: "Bowling" },
        ],
      },
      {
        id: "volunteering_community",
        label: "Community & Giving",
        emoji: "🤝",
        tags: [
          { id: "volunteering_social", label: "Volunteering" },
          { id: "community_organizing", label: "Community Organizing" },
          { id: "mentoring", label: "Mentoring" },
          { id: "charity_fundraising", label: "Charity & Fundraising" },
          { id: "activism", label: "Civic Activism" },
        ],
      },
    ],
  },
  {
    id: "travel",
    label: "Travel & Outdoors",
    description: "How you experience new places",
    color: "bg-orange-500",
    subcategories: [
      {
        id: "travel_style",
        label: "Travel Style",
        emoji: "✈️",
        tags: [
          { id: "backpacking_travel", label: "Backpacking" },
          { id: "luxury_travel_style", label: "Luxury Travel" },
          { id: "solo_travel_style", label: "Solo Travel" },
          { id: "road_trips_travel", label: "Road Trips" },
          { id: "city_breaks_travel", label: "City Breaks" },
          { id: "slow_travel", label: "Slow Travel" },
        ],
      },
      {
        id: "nature_outdoors",
        label: "Nature & Outdoors",
        emoji: "🏕️",
        tags: [
          { id: "camping_outdoors", label: "Camping" },
          { id: "wild_swimming", label: "Wild Swimming" },
          { id: "foraging", label: "Foraging" },
          { id: "birdwatching", label: "Birdwatching" },
          { id: "stargazing", label: "Stargazing" },
          { id: "gardening", label: "Gardening" },
        ],
      },
      {
        id: "photography_travel",
        label: "Photography",
        emoji: "📷",
        tags: [
          { id: "street_photography", label: "Street Photography" },
          { id: "landscape_photography", label: "Landscape Photography" },
          { id: "portrait_photography", label: "Portrait Photography" },
          { id: "film_photography", label: "Film Photography" },
          { id: "drone_photography", label: "Drone Photography" },
        ],
      },
    ],
  },
  {
    id: "mind_culture",
    label: "Mind & Culture",
    description: "How you learn and engage with ideas",
    color: "bg-blue-500",
    subcategories: [
      {
        id: "literature",
        label: "Literature & Books",
        emoji: "📚",
        tags: [
          { id: "literary_fiction", label: "Literary Fiction" },
          { id: "sci_fi_fantasy", label: "Sci-Fi & Fantasy" },
          { id: "non_fiction", label: "Non-Fiction" },
          { id: "self_help_books", label: "Self-Help" },
          { id: "history_books", label: "History" },
          { id: "philosophy_books", label: "Philosophy" },
          { id: "comics_graphic", label: "Comics & Graphic Novels" },
        ],
      },
      {
        id: "film_tv",
        label: "Film & TV",
        emoji: "🎬",
        tags: [
          { id: "arthouse_film", label: "Arthouse Film" },
          { id: "documentary_film", label: "Documentaries" },
          { id: "genre_film", label: "Genre Film" },
          { id: "tv_drama", label: "Drama Series" },
          { id: "anime_watching", label: "Anime" },
          { id: "horror_film", label: "Horror" },
          { id: "film_making", label: "Filmmaking" },
        ],
      },
      {
        id: "culture_arts",
        label: "Culture & Art Scenes",
        emoji: "🏛️",
        tags: [
          { id: "museums_galleries", label: "Museums & Galleries" },
          { id: "theatre_watching", label: "Theatre" },
          { id: "opera_ballet", label: "Opera & Ballet" },
          { id: "architecture", label: "Architecture" },
          { id: "cultural_festivals", label: "Cultural Festivals" },
          { id: "vinyl_record_collecting", label: "Vinyl & Record Collecting" },
        ],
      },
      {
        id: "learning",
        label: "Learning & Thinking",
        emoji: "🧠",
        tags: [
          { id: "languages_learning", label: "Language Learning" },
          { id: "psychology_interest", label: "Psychology" },
          { id: "economics_interest", label: "Economics" },
          { id: "history_interest", label: "History" },
          { id: "debates_discussion", label: "Debates & Discussion" },
          { id: "podcasts_interest", label: "Podcasts" },
          { id: "logic_puzzles", label: "Logic & Puzzles" },
        ],
      },
    ],
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    description: "The rhythms and values that shape your everyday life",
    color: "bg-teal-500",
    subcategories: [
      {
        id: "wellness_mindfulness",
        label: "Wellness & Mindfulness",
        emoji: "🧘",
        tags: [
          { id: "meditation", label: "Meditation" },
          { id: "breathwork", label: "Breathwork" },
          { id: "journaling", label: "Journaling" },
          { id: "cold_therapy", label: "Cold Therapy / Sauna" },
          { id: "sleep_optimisation", label: "Sleep Optimisation" },
          { id: "mental_health_advocacy", label: "Mental Health Advocacy" },
        ],
      },
      {
        id: "nutrition",
        label: "Nutrition & Food Lifestyle",
        emoji: "🥗",
        tags: [
          { id: "plant_based_diet", label: "Plant-Based Diet" },
          { id: "intermittent_fasting", label: "Intermittent Fasting" },
          { id: "meal_prep", label: "Meal Prepping" },
          { id: "biohacking_nutrition", label: "Biohacking" },
          { id: "fermenting_pickling", label: "Fermenting & Pickling" },
        ],
      },
      {
        id: "sustainability_lifestyle",
        label: "Sustainability",
        emoji: "🌿",
        tags: [
          { id: "zero_waste", label: "Zero Waste Living" },
          { id: "urban_farming", label: "Urban Farming" },
          { id: "upcycling", label: "Upcycling & Repair" },
          { id: "renewable_energy_interest", label: "Renewable Energy" },
          { id: "ethical_consumption", label: "Ethical Consumption" },
        ],
      },
      {
        id: "entrepreneurship_career",
        label: "Work & Entrepreneurship",
        emoji: "💼",
        tags: [
          { id: "startups", label: "Startups" },
          { id: "investing", label: "Investing" },
          { id: "freelancing", label: "Freelancing" },
          { id: "side_projects", label: "Side Projects" },
          { id: "personal_development", label: "Personal Development" },
          { id: "public_speaking", label: "Public Speaking" },
        ],
      },
      {
        id: "animals_nature",
        label: "Animals & Pets",
        emoji: "🐾",
        tags: [
          { id: "dog_owner", label: "Dog Owner / Enthusiast" },
          { id: "cat_owner", label: "Cat Owner / Enthusiast" },
          { id: "horse_riding", label: "Horse Riding" },
          { id: "wildlife_conservation", label: "Wildlife Conservation" },
          { id: "aquariums_terrariums", label: "Aquariums & Terrariums" },
        ],
      },
    ],
  },
];

// ─── Flat lookups ─────────────────────────────────────────────────────────────

/** All L3 leaf tags in a flat array. */
export const ALL_LEAF_TAGS: LeafTag[] = INTEREST_CATEGORIES.flatMap((cat) =>
  cat.subcategories.flatMap((sub) => sub.tags),
);

/** Fast lookup: leafId → LeafTag */
export const LEAF_TAG_BY_ID: Record<string, LeafTag> = ALL_LEAF_TAGS.reduce(
  (acc, tag) => ({ ...acc, [tag.id]: tag }),
  {},
);

/** Fast lookup: leafId → parent Subcategory label */
export const LEAF_TO_SUBCATEGORY: Record<string, string> =
  INTEREST_CATEGORIES.flatMap((cat) =>
    cat.subcategories.flatMap((sub) =>
      sub.tags.map((tag) => ({ id: tag.id, subLabel: sub.label })),
    ),
  ).reduce((acc, { id, subLabel }) => ({ ...acc, [id]: subLabel }), {});

// ─── Constants ────────────────────────────────────────────────────────────────

/** Minimum L3 leaf tags required to continue. */
export const MIN_INTERESTS = 5;

/** Maximum L3 leaf tags a user may select. */
export const MAX_INTERESTS = 30;

// ─── MBTI-seeded suggestions ──────────────────────────────────────────────────
/**
 * Maps 4-letter MBTI types to a starter set of L3 leaf tag ids that
 * statistically correlate with that type's activity profile.
 * Surfaces a "Suggested for you" section on the interests page.
 */
export const MBTI_SUGGESTIONS: Record<string, string[]> = {
  INTJ: ["ai_ml", "physics", "chess", "philosophy_books", "logic_puzzles", "astronomy_science", "non_fiction"],
  INTP: ["ai_ml", "logic_puzzles", "philosophy_books", "tabletop_rpg_games", "open_source", "robotics", "sci_fi_fantasy"],
  ENTJ: ["startups", "investing", "public_speaking", "personal_development", "debates_discussion", "non_fiction", "economics_interest"],
  ENTP: ["debates_discussion", "startups", "podcasts_interest", "ai_ml", "philosophy_books", "comedy_shows", "public_speaking"],
  INFJ: ["fiction_writing", "psychology_interest", "volunteering_social", "meditation", "literary_fiction", "documentary_film", "journaling"],
  INFP: ["poetry_writing", "literary_fiction", "music_production", "journaling", "arthouse_film", "photography_travel", "spoken_word"],
  ENFJ: ["volunteering_social", "mentoring", "debates_discussion", "theatre_acting", "psychology_interest", "cultural_festivals", "languages_learning"],
  ENFP: ["festival_going", "languages_learning", "improv", "street_photography", "spoken_word", "comedy_shows", "cultural_festivals"],
  ISTJ: ["history_interest", "board_games_social", "cooking_home", "cycling", "non_fiction", "economics_interest", "gardening"],
  ISFJ: ["cooking_home", "baking", "volunteering_social", "dog_owner", "board_games_social", "museums_galleries", "zero_waste"],
  ESTJ: ["football", "public_speaking", "startups", "board_games_social", "road_trips_travel", "economics_interest", "history_interest"],
  ESFJ: ["dining_restaurants", "cooking_home", "baking", "volunteering_social", "live_concerts", "festival_going", "board_games_social"],
  ISTP: ["cycling", "rock_climbing", "mma", "pc_gaming", "woodworking", "road_trips_travel", "drone_photography"],
  ISFP: ["landscape_photography", "painting", "hiking", "guitar", "yoga_fitness", "slow_travel", "dog_owner"],
  ESTP: ["clubbing", "football", "road_trips_travel", "cocktail_craft", "escape_rooms_social", "surfing", "bar_hopping"],
  ESFP: ["dance_performance", "karaoke_social", "festival_going", "dining_restaurants", "live_concerts", "comedy_shows", "street_photography"],
};
