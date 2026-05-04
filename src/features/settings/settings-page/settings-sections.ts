import {
  Bell,
  Eye,
  LockKeyhole,
  Shield,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import type { SettingsSectionMeta } from "./types";

export const SETTINGS_SECTIONS: SettingsSectionMeta[] = [
  {
    id: "account",
    label: "Account",
    description: "Profile details and photo",
    headline: "Make your profile feel like you",
    summary:
      "Keep the basics people see before a group starts: name, photo, city, and a short intro.",
    icon: UserRound,
  },
  {
    id: "matching",
    label: "Group fit",
    description: "Personality, interests, and forming rules",
    headline: "Shape how your groups come together",
    summary:
      "Adjust the signals TeamForge uses when it includes you in compatible activity groups.",
    icon: SlidersHorizontal,
  },
  {
    id: "privacy",
    label: "Privacy",
    description: "What other people can see",
    headline: "Choose what shows on your profile",
    summary:
      "Decide which personal details stay visible and which ones only guide private compatibility.",
    icon: Eye,
  },
  {
    id: "security",
    label: "Security",
    description: "Sign-in, sessions, and recovery",
    headline: "Keep your account under your control",
    summary:
      "Review sign-in details, recover access, and remove sessions you no longer trust.",
    icon: LockKeyhole,
  },
  {
    id: "safety",
    label: "Safety",
    description: "Blocked people and access controls",
    headline: "Manage blocked people",
    summary:
      "Review who cannot reach you in direct chats and restore access when it feels right.",
    icon: Shield,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "In-app and email delivery",
    headline: "Decide what deserves your attention",
    summary:
      "Choose the updates that stay in TeamForge and the ones that can also reach your inbox.",
    icon: Bell,
  },
];

export function getSettingsSectionMeta(sectionId: string) {
  return SETTINGS_SECTIONS.find((section) => section.id === sectionId) ?? null;
}
