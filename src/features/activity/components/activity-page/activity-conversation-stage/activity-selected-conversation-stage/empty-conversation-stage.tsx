import { ActivityEmptyState } from "@/features/activity/components/activity-page/activity-conversation-stage/activity-empty-state";

export function EmptyConversationStage() {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1">
      <ActivityEmptyState />
    </div>
  );
}
