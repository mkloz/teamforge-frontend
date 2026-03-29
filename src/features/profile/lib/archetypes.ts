import type { MBTIType } from "../types/profile.types";

interface TypeInfo {
  title: string;
  archetype: string;
}

export const TYPE_INFO: Record<MBTIType, TypeInfo> = {
  // Analysts
  INTJ: { title: "The Architect", archetype: "The Strategist" },
  INTP: { title: "The Logician", archetype: "The Thinker" },
  ENTJ: { title: "The Commander", archetype: "The Leader" },
  ENTP: { title: "The Debater", archetype: "The Visionary" },
  // Diplomats
  INFJ: { title: "The Advocate", archetype: "The Guide" },
  INFP: { title: "The Mediator", archetype: "The Dreamer" },
  ENFJ: { title: "The Protagonist", archetype: "The Mentor" },
  ENFP: { title: "The Campaigner", archetype: "The Spark" },
  // Sentinels
  ISTJ: { title: "The Logistician", archetype: "The Anchor" },
  ISFJ: { title: "The Defender", archetype: "The Caretaker" },
  ESTJ: { title: "The Executive", archetype: "The Director" },
  ESFJ: { title: "The Consul", archetype: "The Host" },
  // Explorers
  ISTP: { title: "The Virtuoso", archetype: "The Craftsman" },
  ISFP: { title: "The Adventurer", archetype: "The Artist" },
  ESTP: { title: "The Entrepreneur", archetype: "The Dynamo" },
  ESFP: { title: "The Entertainer", archetype: "The Performer" },
};

export function getTypeTitle(type: MBTIType): string {
  return TYPE_INFO[type].title;
}

export function getArchetype(type: MBTIType): string {
  return TYPE_INFO[type].archetype;
}
