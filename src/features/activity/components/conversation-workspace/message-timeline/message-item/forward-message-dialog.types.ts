import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { GroupApi } from "@/shared/schemas";

export interface ForwardMessageDialogProps {
  message?: UnifiedMessage;
  messages?: UnifiedMessage[];
  onForward?: (
    message: UnifiedMessage,
    targetChatId: string,
  ) => Promise<unknown>;
  onForwardComplete?: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  isOnline?: boolean;
}

export type ForwardMessageHandler = NonNullable<
  ForwardMessageDialogProps["onForward"]
>;

export interface ForwardDialogStateProps {
  description: string;
  label: string;
  role?: "alert" | "status";
}

export interface ForwardDialogModel {
  state: ForwardDialogStateProps | null;
  targets: ForwardTarget[];
}

export interface ForwardTarget {
  avatar: string | null;
  avatarMedia?: GroupApi["avatarMedia"];
  chatId: string;
  kind: "dm" | "group";
  title: string;
}
