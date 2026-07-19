import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { buildMediaUrl } from "@/shared/lib/media-url";

export const LEARNING_TEMPLATES: TemplateSeed[] = [
  {
    id: "study",
    title: "Study group",
    description:
      "Bring a task, set a goal, and work quietly alongside the group.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/study/original.webp",
    ),
    groupName: "Study Partners",
    groupDescription: "A group for focused study and shared accountability.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["study", "learning", "focus"],
  },
  {
    id: "workshop",
    title: "Skill sharing",
    description:
      "Each person teaches one practical skill and learns another from the group.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/workshop/original.webp",
    ),
    groupName: "Skill Sharers",
    groupDescription: "A group for teaching and learning practical skills.",
    recommendedMinimumGroupSize: 5,
    recommendedMaximumGroupSize: 8,
    interestHints: ["skills", "teaching", "learning"],
  },
  {
    id: "language-table",
    title: "Language exchange",
    description:
      "Practice conversation with people learning the same languages.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/language-table/original.webp",
    ),
    groupName: "Language Exchange",
    groupDescription: "A group for relaxed conversation in another language.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["languages", "conversation", "learning"],
  },
  {
    id: "book-club",
    title: "Book club",
    description: "Read the same book or short text and discuss it together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/book-club/original.webp",
    ),
    groupName: "Book Club",
    groupDescription: "A group for shared reading and discussion.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["books", "reading", "discussion"],
  },
  {
    id: "portfolio-review",
    title: "Career portfolio feedback",
    description:
      "Bring work samples for a job application and exchange specific feedback.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/portfolio-review/original.webp",
    ),
    groupName: "Career Portfolio Review",
    groupDescription:
      "A group for improving portfolios used in job applications.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["portfolio", "feedback", "career"],
  },
  {
    id: "mini-lecture",
    title: "Short talks night",
    description: "Each person explains a topic briefly, followed by questions.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/mini-lecture/original.webp",
    ),
    groupName: "Short Talks Night",
    groupDescription: "A group for short presentations and curious questions.",
    recommendedMinimumGroupSize: 5,
    recommendedMaximumGroupSize: 8,
    interestHints: ["presentations", "learning", "public speaking"],
  },
  {
    id: "exam-sprint",
    title: "Exam study group",
    description: "Revise together, compare notes, and take regular breaks.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/exam-sprint/original.webp",
    ),
    groupName: "Exam Study Partners",
    groupDescription: "A group for focused exam revision.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["exam revision", "study", "learning"],
  },
  {
    id: "tutorial-watch",
    title: "Online course study",
    description:
      "Watch one tutorial, pause for questions, then try it together.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/tutorial-watch/original.webp",
    ),
    groupName: "Online Study Club",
    groupDescription:
      "A group for following tutorials and practising together.",
    locationType: "ONLINE",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["tutorials", "online learning", "practice"],
  },
  {
    id: "coding-kata",
    title: "Coding practice",
    description: "Solve a small programming problem and compare solutions.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/coding-kata/original.webp",
    ),
    groupName: "Coding Practice",
    groupDescription: "A group for regular programming exercises.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["coding", "programming", "practice"],
  },
  {
    id: "reading-sprint",
    title: "Quiet reading hour",
    description: "Read quietly together, then share a few thoughts at the end.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/reading-sprint/original.webp",
    ),
    groupName: "Quiet Readers",
    groupDescription: "A group for making time to read.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["reading", "books", "quiet time"],
  },
  {
    id: "photo-basics",
    title: "Beginner photography walk",
    description: "Practise framing and lighting on a short photo walk.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/photo-basics/original.webp",
    ),
    groupName: "Photography Beginners",
    groupDescription: "A group for learning photography by taking pictures.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["photography", "photo walk", "beginners"],
  },
  {
    id: "public-speaking",
    title: "Public speaking practice",
    description: "Give a short talk and get kind, specific feedback.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/public-speaking/original.webp",
    ),
    groupName: "Public Speaking Practice",
    groupDescription: "A group for practising talks and building confidence.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["public speaking", "presentations", "practice"],
  },
  {
    id: "finance-basics",
    title: "Budgeting basics",
    description:
      "Compare simple ways to plan spending, saving, and monthly bills.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/finance-basics/original.webp",
    ),
    groupName: "Budgeting Basics",
    groupDescription: "A group for learning practical personal finance.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["budgeting", "personal finance", "learning"],
  },
  {
    id: "language-walk",
    title: "Language practice walk",
    description:
      "Take a walk while practising everyday conversation in another language.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/language-walk/original.webp",
    ),
    groupName: "Walking Language Exchange",
    groupDescription: "A group for language practice on a casual walk.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["languages", "conversation", "walking"],
  },
  {
    id: "notion-systems",
    title: "Study planning",
    description:
      "Compare note-taking and weekly study plans, then set up one to try.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/notion-systems/original.webp",
    ),
    groupName: "Study Planners",
    groupDescription:
      "A group for organising notes, deadlines, and study time.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["study planning", "note-taking", "organisation"],
  },
  {
    id: "debate-table",
    title: "Debate practice",
    description:
      "Choose a topic, take opposing views, and practise making clear arguments.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/debate-table/original.webp",
    ),
    groupName: "Debate Practice",
    groupDescription:
      "A group for structured debates and thoughtful discussion.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["debate", "discussion", "public speaking"],
  },
  {
    id: "career-skills",
    title: "Job interview practice",
    description:
      "Take turns answering interview questions and giving feedback.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/career-skills/original.webp",
    ),
    groupName: "Interview Practice",
    groupDescription: "A group for interview practice and CV feedback.",
    recommendedMinimumGroupSize: 3,
    recommendedMaximumGroupSize: 5,
    interestHints: ["job interviews", "career", "cv"],
  },
  {
    id: "history-walk",
    title: "Local history walk",
    description:
      "Walk a local route and learn the stories behind its buildings and landmarks.",
    coverImageSource: buildMediaUrl(
      "/uploads/seed-media/template-covers/learning/history-walk/original.webp",
    ),
    groupName: "Local History Walk",
    groupDescription: "A group for exploring local history on foot.",
    recommendedMinimumGroupSize: 4,
    recommendedMaximumGroupSize: 6,
    interestHints: ["local history", "walking", "culture"],
  },
];
