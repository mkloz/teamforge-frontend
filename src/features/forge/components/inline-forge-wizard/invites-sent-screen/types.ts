import type { LucideIcon } from "lucide-react";

import type { ForgeWizardChildProps } from "../types";

export type InvitesSentScreenProps = ForgeWizardChildProps;

export interface InvitesSentSummary {
  avatarImage: string | null;
  coverImage: string | null;
  displayGroupName: string;
  groupDescription: string;
  inviteCount: number;
  isManual: boolean;
  memberCount: number;
  planName: string;
}

export interface StatusFactItem {
  label: string;
  value: string;
}

export interface NextActionItem {
  icon: LucideIcon;
  text: string;
  title: string;
}
