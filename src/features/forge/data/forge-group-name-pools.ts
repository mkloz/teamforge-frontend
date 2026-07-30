export interface GroupNameProfile {
  id: string;
  matchTerms: string[];
  names: string[];
}

export const TOPIC_NAME_PROFILES: GroupNameProfile[] = [
  {
    id: "comedy",
    matchTerms: ["comedy", "open mic", "stand-up", "standup"],
    names: [
      "Comedy Night",
      "The Comedy Table",
      "Open Mic Regulars",
      "Local Laughs",
    ],
  },
  {
    id: "photography",
    matchTerms: ["photography", "photo", "camera"],
    names: [
      "Local Photo Walk",
      "Camera Club",
      "Photo Walkers",
      "Photography Meetup",
    ],
  },
  {
    id: "product",
    matchTerms: ["product idea", "product feedback", "prototype", "startup"],
    names: [
      "Product Feedback Club",
      "Prototype Testers",
      "Idea Workshop",
      "Product People",
    ],
  },
  {
    id: "books",
    matchTerms: ["book", "reading", "literature", "poetry"],
    names: [
      "The Reading Table",
      "Book Club Regulars",
      "Books and Company",
      "Local Readers",
    ],
  },
  {
    id: "coffee",
    matchTerms: ["coffee", "cafe", "café", "tea"],
    names: [
      "Coffee and Company",
      "The Cafe Table",
      "Local Coffee Meetup",
      "Coffee Regulars",
    ],
  },
  {
    id: "food",
    matchTerms: [
      "brunch",
      "cooking",
      "dinner",
      "food",
      "market",
      "picnic",
      "supper",
    ],
    names: [
      "The Shared Table",
      "Local Food Club",
      "Dinner Friends",
      "Cook and Share",
    ],
  },
  {
    id: "running",
    matchTerms: ["run", "running", "jog"],
    names: [
      "Local Run Club",
      "Easy Pace Runners",
      "Run Together",
      "The Running Group",
    ],
  },
  {
    id: "walking",
    matchTerms: ["walk", "walking", "hike", "hiking", "trail"],
    names: [
      "Weekend Walkers",
      "Local Walking Club",
      "Walk Together",
      "The Trail Group",
    ],
  },
  {
    id: "cycling",
    matchTerms: ["bike", "cycling", "cycle"],
    names: [
      "Local Cycle Club",
      "Social Riders",
      "Ride Together",
      "Weekend Cyclists",
    ],
  },
  {
    id: "climbing",
    matchTerms: ["bouldering", "climbing"],
    names: [
      "Climbing Partners",
      "Local Bouldering Club",
      "The Climbing Group",
      "Climb Together",
    ],
  },
  {
    id: "team-sport",
    matchTerms: [
      "badminton",
      "basketball",
      "football",
      "frisbee",
      "padel",
      "tennis",
      "volleyball",
    ],
    names: [
      "Local Players",
      "Game Day Group",
      "After-Work Sport",
      "Play Together",
    ],
  },
  {
    id: "games",
    matchTerms: ["board game", "chess", "game", "gaming", "rpg", "tabletop"],
    names: [
      "Game Night Regulars",
      "The Games Table",
      "Local Players",
      "One More Game",
    ],
  },
  {
    id: "arts",
    matchTerms: [
      "art",
      "collage",
      "craft",
      "design",
      "drawing",
      "gallery",
      "museum",
      "pottery",
    ],
    names: [
      "Local Arts Club",
      "The Making Table",
      "Gallery Friends",
      "Art Meetup",
    ],
  },
  {
    id: "music",
    matchTerms: ["album", "concert", "gig", "jam", "karaoke", "music", "song"],
    names: [
      "The Listening Room",
      "Local Music Club",
      "Gig Friends",
      "Music Meetup",
    ],
  },
  {
    id: "technology",
    matchTerms: [
      "app",
      "coding",
      "data",
      "interface",
      "robotics",
      "software",
      "tech",
    ],
    names: [
      "Side Project Club",
      "Build Together",
      "Tech Meetup",
      "The Project Table",
    ],
  },
  {
    id: "learning",
    matchTerms: [
      "career",
      "debate",
      "exam",
      "language",
      "practice",
      "speaking",
      "study",
    ],
    names: [
      "Study Partners",
      "Practice Group",
      "Skills Swap",
      "Learning Together",
    ],
  },
  {
    id: "wellbeing",
    matchTerms: [
      "breathwork",
      "meditation",
      "mindful",
      "pilates",
      "stretching",
      "wellbeing",
      "yoga",
    ],
    names: [
      "Wellbeing Club",
      "Reset Together",
      "Mindful Meetup",
      "Gentle Habits",
    ],
  },
  {
    id: "dogs",
    matchTerms: ["dog", "dogs"],
    names: [
      "Local Dog Walkers",
      "Dogs and Company",
      "The Walking Pack",
      "Neighbourhood Dog Walk",
    ],
  },
];

export const CATEGORY_NAME_PROFILES: GroupNameProfile[] = [
  {
    id: "sports",
    matchTerms: ["sport & movement"],
    names: [
      "Training Partners",
      "Local Players",
      "Move Together",
      "After-Work Sport",
    ],
  },
  {
    id: "gaming",
    matchTerms: ["games & play"],
    names: [
      "Game Night Regulars",
      "The Games Table",
      "Local Players",
      "One More Game",
    ],
  },
  {
    id: "social",
    matchTerms: ["social & nightlife"],
    names: [
      "Coffee and Company",
      "The Social Table",
      "Local Meetups",
      "New Faces",
    ],
  },
  {
    id: "arts",
    matchTerms: ["arts & culture"],
    names: [
      "Local Arts Club",
      "Gallery Friends",
      "The Making Table",
      "Creative Meetup",
    ],
  },
  {
    id: "music",
    matchTerms: ["music & shows"],
    names: [
      "The Listening Room",
      "Local Music Club",
      "Gig Friends",
      "Music Meetup",
    ],
  },
  {
    id: "outdoors",
    matchTerms: ["outdoors & nature"],
    names: [
      "Outside Together",
      "Local Trails",
      "Fresh Air Club",
      "Weekend Walkers",
    ],
  },
  {
    id: "learning",
    matchTerms: ["study & skills"],
    names: [
      "Study Partners",
      "Skills Swap",
      "Practice Group",
      "Learning Together",
    ],
  },
  {
    id: "food",
    matchTerms: ["food & drink"],
    names: [
      "The Shared Table",
      "Local Food Club",
      "Dinner Friends",
      "Taste Together",
    ],
  },
  {
    id: "tech",
    matchTerms: ["tech & build"],
    names: [
      "Side Project Club",
      "Build Together",
      "Product People",
      "Tech Meetup",
    ],
  },
  {
    id: "wellness",
    matchTerms: ["wellness & reset"],
    names: [
      "Wellbeing Club",
      "Reset Together",
      "Mindful Meetup",
      "Gentle Habits",
    ],
  },
  {
    id: "travel",
    matchTerms: ["day trips & discovery"],
    names: [
      "Local Explorers",
      "Day Trip Club",
      "Nearby Adventures",
      "Weekend Wanderers",
    ],
  },
  {
    id: "other",
    matchTerms: ["projects & wildcards"],
    names: [
      "Local Projects",
      "Try Something New",
      "Good Company",
      "The Meetup Group",
    ],
  },
];

export const DEFAULT_GROUP_NAMES = [
  "Local Meetup",
  "Common Ground",
  "The Regulars",
  "Good Company",
];
