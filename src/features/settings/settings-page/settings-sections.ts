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

interface SettingsSectionGroup {
  id: string;
  label: string;
  sections: readonly SettingsSectionMeta[];
}

export const SETTINGS_SECTION_GROUPS: readonly SettingsSectionGroup[] = [
  {
    id: "profile",
    label: "Your profile",
    sections: [
      {
        id: "account",
        label: "Account",
        headline: "Profile and account",
        description:
          "Manage your public identity, personal details, and account status.",
        icon: UserRound,
      },
      {
        id: "appearance",
        label: "Appearance",
        headline: "Appearance",
        description:
          "Set the mode, interface style, and palette used across TeamForge.",
        icon: Palette,
      },
    ],
  },
  {
    id: "preferences",
    label: "Preferences",
    sections: [
      {
        id: "matching",
        label: "Group fit",
        headline: "Group fit",
        description:
          "Control availability, group fit, and the signals TeamForge uses for groups.",
        icon: SlidersHorizontal,
      },
      {
        id: "notifications",
        label: "Notifications",
        headline: "Notification delivery",
        icon: Bell,
      },
    ],
  },
  {
    id: "privacy-safety",
    label: "Privacy and safety",
    sections: [
      {
        id: "privacy",
        label: "Privacy",
        headline: "Profile privacy",
        description:
          "Choose what appears on your profile and manage a copy of your TeamForge data.",
        icon: Eye,
      },
      {
        id: "security",
        label: "Security",
        headline: "Security and access",
        description:
          "Manage how you sign in, review active devices, and control account access.",
        icon: LockKeyhole,
      },
      {
        id: "safety",
        label: "Safety",
        headline: "Reports and account safety",
        description:
          "Review safety activity, account restrictions, and people you have blocked.",
        icon: Shield,
      },
    ],
  },
];

export const SETTINGS_SECTIONS = SETTINGS_SECTION_GROUPS.flatMap(
  ({ sections }) => sections,
);

export function getSettingsSectionMeta(sectionId: string) {
  return SETTINGS_SECTIONS.find((section) => section.id === sectionId) ?? null;
}
