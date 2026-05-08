import { ActivityConversationStage } from "@/features/activity/components/activity-page/activity-conversation-stage";
import { ActivitySidebar } from "@/features/activity/components/activity-page/activity-sidebar";
import { useActivity } from "@/features/activity/hooks/use-activity";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { cn } from "@/shared/lib/utils";

/**
 * ActivityPage - The main feature orchestrator for Unified Conversations,
 * Groups and Direct Chats.
 */
export function ActivityPage() {
  const activity = useActivity();
  const isMobile = useMediaQuery("(max-width: 1024px)");

  return (
    <div
      className={cn(
        "fixed inset-0 top-0 flex bg-canvas md:left-14",
        !activity.hasSelection ? "pb-12 md:pb-0" : "pb-0",
      )}
    >
      <ActivitySidebar activity={activity} />

      <main
        className={cn(
          "flex min-w-0 flex-1 duration-300",
          !activity.hasSelection && "hidden md:flex",
        )}
      >
        <ActivityConversationStage activity={activity} isMobile={isMobile} />
      </main>
    </div>
  );
}
