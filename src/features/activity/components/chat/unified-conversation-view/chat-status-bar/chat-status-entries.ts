import type {
  Plan,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { formatChatFullDate } from "@/features/activity/lib/chat-utils";
import { formatPlanLocation } from "@/features/activity/lib/plan-location";
import type { PinnedEntry } from "./chat-status-bar-types";
import {
  getPlanStatusConfig,
  PINNED_MESSAGE_CONFIG,
} from "./chat-status-plan-config";

export function buildPinnedEntries(
  plan: Plan | undefined,
  pinnedMessages: UnifiedMessage[],
): PinnedEntry[] {
  const entries: PinnedEntry[] = [];

  if (plan) {
    const config = getPlanStatusConfig(plan);
    entries.push({
      id: `plan-${plan.id}`,
      label: config.label,
      body: `${plan.title} · ${
        plan.dateTime ? formatChatFullDate(plan.dateTime) : "Date TBD"
      } · ${formatPlanLocation(plan)}`,
      accentClass: config.accentClass,
      colorClass: config.colorClass,
      icon: config.icon,
      isPlan: true,
    });
  }

  for (const message of pinnedMessages) {
    entries.push({
      id: `pinned-${message.id}`,
      label: PINNED_MESSAGE_CONFIG.label,
      body: message.content,
      accentClass: PINNED_MESSAGE_CONFIG.accentClass,
      colorClass: PINNED_MESSAGE_CONFIG.colorClass,
      icon: PINNED_MESSAGE_CONFIG.icon,
      isPlan: false,
      messageId: message.id,
    });
  }

  return entries;
}
