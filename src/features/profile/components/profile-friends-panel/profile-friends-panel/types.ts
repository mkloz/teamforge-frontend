import type { LucideIcon } from "lucide-react";

export type TabValue = "friends" | "requests" | "public_friends";

export interface FriendsPanelTabItem {
  Icon: LucideIcon;
  label: string;
  value: TabValue;
}
