import type { Phase } from "./algorithm-types";

export const CANDIDATES = [
  { mbti: "INFP", interest: "Art" },
  { mbti: "ENTP", interest: "Tech" },
  { mbti: "ESTJ", interest: "Sport" },
  { mbti: "INTJ", interest: "Code" },
  { mbti: "ENFJ", interest: "Music" },
  { mbti: "ISTP", interest: "Sport" },
  { mbti: "ENTJ", interest: "Tech" },
  { mbti: "INFJ", interest: "Art" },
  { mbti: "ESFP", interest: "Music" },
  { mbti: "INTP", interest: "Tech" },
  { mbti: "ISFJ", interest: "Cook" },
  { mbti: "ENFP", interest: "Travel" },
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
