import { ActivityPageLoading } from "@/features/activity/activity-page.loading";
import { ActivityPageContent } from "@/features/activity/components/activity-page/activity-page-content";
import { useActivity } from "@/features/activity/hooks/use-activity";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const ACTIVITY_PAGE_METADATA = createTeamForgePageMetadata({
  title: "Activity",
  description:
    "Use Activity to view conversations, group plans, direct chats, and pending decisions.",
});

/**
 * Renders the Activity page and its conversation workspace.
 */
export function ActivityPage() {
  usePageMetadata(ACTIVITY_PAGE_METADATA);

  const activity = useActivity();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const isOnline = useNetworkStatus();

  if (activity.isInitialLoading && isOnline) {
    return <ActivityPageLoading mode="query" />;
  }

  return (
    <ActivityPageContent
      activity={activity}
      isMobile={isMobile}
      isOnline={isOnline}
    />
  );
}
