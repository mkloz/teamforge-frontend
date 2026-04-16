import type { Phase } from "./algorithm-types";

export const CANDIDATES = [
  {
    id: 1,
    mbti: "INTJ",
    color: "#14b8a6",
    tag: "Architect",
    avatar: "/avatars/avatar-1.jpg",
  },
  {
    id: 2,
    mbti: "ENFP",
    color: "#f59e0b",
    tag: "Campaigner",
    avatar: "/avatars/avatar-2.jpg",
  },
  {
    id: 3,
    mbti: "ISTP",
    color: "#0ea5e9",
    tag: "Virtuoso",
    avatar: "/avatars/avatar-3.jpg",
  },
  {
    id: 4,
    mbti: "ESFJ",
    color: "#10b981",
    tag: "Consul",
    avatar: "/avatars/avatar-4.jpg",
  },
  {
    id: 5,
    mbti: "INFP",
    color: "#8b5cf6",
    tag: "Mediator",
    avatar: "/avatars/avatar-5.jpg",
  },
  {
    id: 6,
    mbti: "ENTJ",
    color: "#f43f5e",
    tag: "Commander",
    avatar: "/avatars/avatar-6.jpg",
  },
  {
    id: 7,
    mbti: "ISFJ",
    color: "#06b6d4",
    tag: "Defender",
    avatar: "/avatars/avatar-7.jpg",
  },
  {
    id: 8,
    mbti: "ESTP",
    color: "#f97316",
    tag: "Entrepreneur",
    avatar: "/avatars/avatar-8.jpg",
  },
  {
    id: 9,
    mbti: "INTP",
    color: "#8b5cf6",
    tag: "Logician",
    avatar: "/avatars/avatar-9.jpg",
  },
  {
    id: 10,
    mbti: "ESFP",
    color: "#f59e0b",
    tag: "Entertainer",
    avatar: "/avatars/avatar-10.jpg",
  },
  {
    id: 11,
    mbti: "ISTJ",
    color: "#14b8a6",
    tag: "Logistician",
    avatar: "/avatars/avatar-11.jpg",
  },
  {
    id: 12,
    mbti: "ENFJ",
    color: "#10b981",
    tag: "Protagonist",
    avatar: "/avatars/avatar-12.jpg",
  },
];

export const SELECTED_IDS = new Set([2, 4, 7, 10]);

export const FACTORS = [
  { label: "How you connect", weight: 30, color: "#0D9488" },
  { label: "Personality mesh", weight: 30, color: "#14B8A6" },
  { label: "Mutual friends", weight: 20, color: "#F59E0B" },
  { label: "Trust score", weight: 10, color: "#0D9488" },
  { label: "Age alignment", weight: 10, color: "#14B8A6" },
];

export const PHASE_LABELS: Record<Phase, string> = {
  idle: "",
  scanning: "Looking for people nearby...",
  evaluating: "Exploring how you'll click...",
  selecting: "Forging your group...",
  formed: "Your group is ready.",
};
