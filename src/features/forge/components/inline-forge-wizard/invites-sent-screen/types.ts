import type { ReactNode } from "react";

import type { ForgeWizardChildProps } from "../types";

export type InvitesSentScreenProps = ForgeWizardChildProps;

export interface InvitesSentSummary {
  displayGroupName: string;
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
  active?: boolean;
  icon: ReactNode;
  text: string;
  title: string;
  tone?: "teal" | "amber";
}
