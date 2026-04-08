import type { Phase } from "./algorithm-types";

export const CANDIDATES = [
  {
    id: 1,
    mbti: "INTJ",
    color: "#14b8a6",
    interest: "Strategy",
    avatar: "/avatars/avatar-1.jpg",
  },
  {
    id: 2,
    mbti: "ENFP",
    color: "#f59e0b",
    interest: "Creative",
    avatar: "/avatars/avatar-2.jpg",
  },
  {
    id: 3,
    mbti: "ISTP",
    color: "#0ea5e9",
    interest: "Maker",
    avatar: "/avatars/avatar-3.jpg",
  },
  {
    id: 4,
    mbti: "ESFJ",
    color: "#10b981",
    interest: "Social",
    avatar: "/avatars/avatar-4.jpg",
  },
  {
    id: 5,
    mbti: "INFP",
    color: "#8b5cf6",
    interest: "Arts",
    avatar: "/avatars/avatar-5.jpg",
  },
  {
    id: 6,
    mbti: "ENTJ",
    color: "#f43f5e",
    interest: "Leadership",
    avatar: "/avatars/avatar-6.jpg",
  },
  {
    id: 7,
    mbti: "ISFJ",
    color: "#06b6d4",
    interest: "Planning",
    avatar: "/avatars/avatar-7.jpg",
  },
  {
    id: 8,
    mbti: "ESTP",
    color: "#f97316",
    interest: "Action",
    avatar: "/avatars/avatar-8.jpg",
  },
  {
    id: 9,
    mbti: "INTP",
    color: "#8b5cf6",
    interest: "Logic",
    avatar: "/avatars/avatar-9.jpg",
  },
  {
    id: 10,
    mbti: "ESFP",
    color: "#f59e0b",
    interest: "Events",
    avatar: "/avatars/avatar-10.jpg",
  },
  {
    id: 11,
    mbti: "ISTJ",
    color: "#14b8a6",
    interest: "Data",
    avatar: "/avatars/avatar-11.jpg",
  },
  {
    id: 12,
    mbti: "ENFJ",
    color: "#10b981",
    interest: "Mentorship",
    avatar: "/avatars/avatar-12.jpg",
  },
];

export const SELECTED_IDS = new Set([2, 4, 7, 10]);

export const FACTORS = [
  { label: "Personality match", weight: 30, color: "#0D9488" },
  { label: "Shared interests", weight: 30, color: "#14B8A6" },
  { label: "Friend connections", weight: 20, color: "#F59E0B" },
  { label: "Reliability", weight: 10, color: "#0D9488" },
  { label: "Age range", weight: 10, color: "#14B8A6" },
];

export const PHASE_LABELS: Record<Phase, string> = {
  idle: "",
  scanning: "Scanning for compatible people nearby...",
  evaluating: "Evaluating personality and interests...",
  selecting: "Picking your perfect group...",
  formed: "Group forged.",
};
