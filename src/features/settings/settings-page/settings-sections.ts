import {
  Bell,
  Eye,
  LockKeyhole,
  Palette,
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
    headline: "Update your profile details",
    summary:
      "Keep the basics people see before a group starts: name, photo, city, and a short intro.",
    icon: UserRound,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme and display comfort",
    headline: "Choose how TeamForge looks",
    summary:
      "Choose the interface theme that feels easiest to use in your current environment.",
    icon: Palette,
  },
  {
    id: "matching",
    label: "Group fit",
    description: "Personality, interests, group preferences",
    headline: "Choose your group preferences",
    summary:
      "Adjust the profile details and preferences TeamForge uses when forming activity groups.",
    icon: SlidersHorizontal,
  },
  {
    id: "privacy",
    label: "Privacy",
    description: "What other people can see",
    headline: "Choose what shows on your profile",
    summary:
      "Decide which personal details others can see and which TeamForge only uses to form groups.",
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
    description: "Reports, account actions, and blocked people",
    headline: "Review your safety options",
    summary:
      "Open the Safety Center, review blocked people, and change access controls.",
    icon: Shield,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "In-app and email delivery",
    headline: "Choose which notifications you receive",
    summary:
      "Choose the updates that stay in TeamForge and the ones that can also reach your inbox.",
    icon: Bell,
  },
];

export function getSettingsSectionMeta(sectionId: string) {
  return SETTINGS_SECTIONS.find((section) => section.id === sectionId) ?? null;
}
