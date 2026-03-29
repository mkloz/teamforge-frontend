export const NotificationType = {
  GROUP_FORMED: "group_formed",
  JOIN_REQUEST: "join_request",
  RATING_PROMPT: "rating_prompt",
  FRIEND_REQUEST: "friend_request",
  SYSTEM: "system",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  avatarUrl?: string;
}
