import { ActivityConversationStage } from "@/features/activity/components/activity-page/activity-conversation-stage";
import { ActivitySidebar } from "@/features/activity/components/activity-page/activity-sidebar";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";
import { cn } from "@/shared/lib/utils";

interface ActivityPageContentProps {
  activity: ActivityWorkspace;
  contained?: boolean;
  isMobile: boolean;
}

function getFrameClassName(contained: boolean, hasSelection: boolean) {
  return cn(
    "top-0 flex h-dvh min-h-0 overflow-clip bg-canvas",
    hasSelection ? "pb-0" : "pb-12 md:pb-0",
    contained ? "absolute inset-0" : "fixed inset-0 md:left-14",
  );
}

export function ActivityPageContent({
  activity,
  contained = false,
  isMobile,
}: ActivityPageContentProps) {
  return (
    <div className={getFrameClassName(contained, activity.hasSelection)}>
      <ActivitySidebar activity={activity} />

      <main
        className={cn(
          "flex h-full min-h-0 min-w-0 flex-1 duration-300",
          !activity.hasSelection && "hidden md:flex",
        )}
      >
        <ActivityConversationStage activity={activity} isMobile={isMobile} />
      </main>
    </div>
  );
}
