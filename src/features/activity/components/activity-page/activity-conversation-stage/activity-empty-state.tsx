import { ActivityNoConversationSelectedVisual } from "@/features/activity/assets/activity-no-conversation-selected";
import { LazyActivityTemplateStartingPoints } from "@/features/activity/components/activity-page/activity-template-starting-points.lazy";

interface ActivityEmptyStateProps {
  showTemplateStartingPoints?: boolean;
}

export function ActivityEmptyState({
  showTemplateStartingPoints = false,
}: ActivityEmptyStateProps) {
  if (showTemplateStartingPoints) {
    return <LazyActivityTemplateStartingPoints variant="stage" />;
  }

  return (
    <section className="hidden flex-1 items-center justify-center bg-canvas/30 backdrop-blur-sm md:flex">
      <div className="max-w-sm px-6 text-center">
        <ActivityNoConversationSelectedVisual className="mx-auto mb-6 h-36 w-auto text-foreground" />
        <h2 className="font-bold text-ink text-lg">Choose a conversation.</h2>
      </div>
    </section>
  );
}
