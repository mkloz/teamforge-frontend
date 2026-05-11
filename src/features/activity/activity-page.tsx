import { ActivityPageLoading } from "@/features/activity/activity-page.loading";
import { ActivityPageContent } from "@/features/activity/components/activity-page/activity-page-content";
import { useActivity } from "@/features/activity/hooks/use-activity";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

/**
 * ActivityPage - The main feature orchestrator for Unified Conversations,
 * Groups and Direct Chats.
 */
export function ActivityPage() {
  const activity = useActivity();
  const isMobile = useMediaQuery("(max-width: 1024px)");

  if (activity.isInitialLoading) {
    return <ActivityPageLoading mode="query" />;
  }

  return <ActivityPageContent activity={activity} isMobile={isMobile} />;
}
