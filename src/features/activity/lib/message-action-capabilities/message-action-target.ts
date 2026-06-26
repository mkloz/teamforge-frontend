import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export type MessageActionTarget = Pick<
  UnifiedMessage,
  "attachments" | "id" | "isOwn" | "proposal" | "status" | "type"
>;
