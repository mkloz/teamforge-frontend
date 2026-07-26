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
    headline: "Profile and account",
    icon: UserRound,
  },
  {
    id: "appearance",
    label: "Appearance",
    headline: "Choose how TeamForge looks",
    icon: Palette,
  },
  {
    id: "matching",
    label: "Group fit",
    headline: "Group preferences",
    icon: SlidersHorizontal,
  },
  {
    id: "privacy",
    label: "Privacy",
    headline: "Profile privacy",
    icon: Eye,
  },
  {
    id: "security",
    label: "Security",
    headline: "Security and access",
    icon: LockKeyhole,
  },
  {
    id: "safety",
    label: "Safety",
    headline: "Reports and account safety",
    icon: Shield,
  },
  {
    id: "notifications",
    label: "Notifications",
    headline: "Notification delivery",
    icon: Bell,
  },
];

export function getSettingsSectionMeta(sectionId: string) {
  return SETTINGS_SECTIONS.find((section) => section.id === sectionId) ?? null;
}
