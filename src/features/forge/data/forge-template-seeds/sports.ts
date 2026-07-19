import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { buildMediaUrl } from "@/shared/lib/media-url";

export const SPORTS_TEMPLATES: TemplateSeed[] = [
  {
    id: "pickup",
    title: "Casual volleyball",
    description:
      "Meet at a local court for a friendly game with mixed skill levels.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/pickup/original.webp",
    ),
    groupName: "Volleyball Players",
    groupDescription: "A group for casual volleyball games and team planning.",
    recommendedMinimumGroupSize: 5,
    recommendedMaximumGroupSize: 8,
    interestHints: ["volleyball", "sport", "fitness", "outdoor"],
  },
  {
    id: "training",
    title: "Strength workout",
    description:
      "Complete a simple gym workout together, with room for different abilities.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/training/original.webp",
    ),
    groupName: "Strength Training",
    groupDescription: "A group for regular strength workouts at the gym.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["strength", "fitness", "gym", "health"],
  },
  {
    id: "court-booking",
    title: "Padel doubles",
    description: "Book a padel court and play a few doubles games together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/court-booking/original.webp",
    ),
    groupName: "Padel Players",
    groupDescription: "A group for casual padel games and court bookings.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["padel", "tennis", "racquet sports", "sport"],
  },
  {
    id: "running-loop",
    title: "Social run club",
    description:
      "Run a local loop together at a pace that leaves room for conversation.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/running-loop/original.webp",
    ),
    groupName: "Local Run Club",
    groupDescription: "A group for social runs on local routes.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["running", "run club", "fitness", "outdoor"],
  },
  {
    id: "climbing-wall",
    title: "Indoor bouldering",
    description:
      "Meet at a climbing wall and work through bouldering routes together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/climbing-wall/original.webp",
    ),
    groupName: "Bouldering Club",
    groupDescription: "A group for bouldering trips and shared climbing tips.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["climbing", "bouldering", "gym", "fitness"],
  },
  {
    id: "weekend-match",
    title: "Weekend football practice",
    description:
      "Meet on a pitch for passing drills and a short football game.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/weekend-match/original.webp",
    ),
    groupName: "Weekend Football Practice",
    groupDescription: "A group for football drills and short games.",
    recommendedMinimumGroupSize: 5,
    recommendedMaximumGroupSize: 8,
    interestHints: ["football", "sport", "fitness"],
  },
  {
    id: "cycle-ride",
    title: "Social cycle ride",
    description:
      "Follow a planned route at a pace that keeps the group together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/cycle-ride/original.webp",
    ),
    groupName: "Local Cyclists",
    groupDescription: "A group for social rides on local routes.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["cycling", "bike", "fitness", "outdoor"],
  },
  {
    id: "recovery-swim",
    title: "Easy recovery swim",
    description: "Meet at the pool for relaxed laps at an easy pace.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/recovery-swim/original.webp",
    ),
    groupName: "Recovery Swimmers",
    groupDescription: "A group for easy pool swims after exercise.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["swim", "recovery", "fitness", "health"],
  },
  {
    id: "five-a-side",
    title: "Small-sided football",
    description: "Book a pitch for a casual small-sided football game.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/five-a-side/original.webp",
    ),
    groupName: "Small-Sided Football",
    groupDescription: "A group for regular small-sided games.",
    recommendedMinimumGroupSize: 5,
    recommendedMaximumGroupSize: 8,
    interestHints: ["football", "sport", "fitness"],
  },
  {
    id: "basketball-shootaround",
    title: "Basketball shootaround",
    description: "Practise shots together, then play a short half-court game.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/basketball-shootaround/original.webp",
    ),
    groupName: "Basketball Players",
    groupDescription: "A group for shootarounds and casual basketball games.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["basketball", "sport", "fitness"],
  },
  {
    id: "badminton-ladder",
    title: "Badminton doubles",
    description:
      "Book a court, play doubles, and switch partners between games.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/badminton-ladder/original.webp",
    ),
    groupName: "Badminton Players",
    groupDescription: "A group for casual doubles games and court bookings.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["badminton", "sport", "court"],
  },
  {
    id: "park-bootcamp",
    title: "Outdoor bootcamp",
    description: "Meet in a park for a simple bodyweight circuit.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/park-bootcamp/original.webp",
    ),
    groupName: "Park Workout",
    groupDescription: "A group for outdoor circuit workouts.",
    recommendedMinimumGroupSize: 5,
    recommendedMaximumGroupSize: 8,
    interestHints: ["fitness", "exercise", "outdoor", "gym"],
  },
  {
    id: "mobility-flow",
    title: "Sports mobility workout",
    description:
      "Work through mobility drills for running, cycling, and gym workouts.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/mobility-flow/original.webp",
    ),
    groupName: "Sports Mobility",
    groupDescription: "A group for mobility work before or after training.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["mobility", "fitness", "running", "cycling"],
  },
  {
    id: "table-tennis",
    title: "Table tennis games",
    description: "Play short games and switch opponents between rounds.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/table-tennis/original.webp",
    ),
    groupName: "Table Tennis Players",
    groupDescription: "A group for casual table tennis games.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["table tennis", "sport", "game"],
  },
  {
    id: "swim-lanes",
    title: "Swim technique practice",
    description: "Book a lane and work on stroke technique at your own pace.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/swim-lanes/original.webp",
    ),
    groupName: "Swim Practice",
    groupDescription: "A group for lane practice and swimming technique.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["swim", "technique", "fitness", "health"],
  },
  {
    id: "beginner-climb",
    title: "Beginner climbing class",
    description: "Book a beginner climbing class and learn the wall together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/beginner-climb/original.webp",
    ),
    groupName: "New Climbers",
    groupDescription:
      "A group for first climbing lessons and beginner practice.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["climbing", "fitness", "gym"],
  },
  {
    id: "cycle-loop",
    title: "Cycling skills practice",
    description:
      "Practise signalling, cornering, and riding together on a short route.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/cycle-loop/original.webp",
    ),
    groupName: "Cycling Practice",
    groupDescription: "A group for practising everyday cycling skills.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["cycling", "bike", "skills", "fitness"],
  },
  {
    id: "frisbee-park",
    title: "Ultimate frisbee",
    description: "Meet in a park for a casual game of ultimate frisbee.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/sports/frisbee-park/original.webp",
    ),
    groupName: "Ultimate Frisbee",
    groupDescription: "A group for friendly frisbee games outdoors.",
    recommendedMinimumGroupSize: 5,
    recommendedMaximumGroupSize: 8,
    interestHints: ["frisbee", "park", "sport", "outdoor"],
  },
];
