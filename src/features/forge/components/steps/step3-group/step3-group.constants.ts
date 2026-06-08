import { Globe, Lock, type LucideIcon, UserCheck } from "lucide-react";

import type { Visibility } from "@/features/forge/lib/forge-contract";

export const VISIBILITY_OPTIONS: Array<{
  value: Visibility;
  label: string;
  description: string;
  Icon: LucideIcon;
}> = [
  {
    value: "PUBLIC",
    label: "Public",
    description: "Anyone on TeamForge can discover and request to join.",
    Icon: Globe,
  },
  {
    value: "FRIENDS_ONLY",
    label: "Friends only",
    description: "Only people in your network can see and request to join.",
    Icon: UserCheck,
  },
  {
    value: "INVITE_ONLY",
    label: "Invite only",
    description: "Hidden from discovery. Members join by invitation only.",
    Icon: Lock,
  },
];
