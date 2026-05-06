import { Link } from "@tanstack/react-router";

import { buildActivityNavigation } from "@/features/activity/lib/activity-route";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { getActiveGroupPreview } from "@/features/home/lib/home-insights";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { Button } from "@/shared/components/ui/button";

import { BrowseGroupsRow } from "./browse-groups-row";
import { collectUnreadGroupIds } from "./group-notification-state";
import { GroupRow } from "./group-row";
import { GroupsGridEmpty } from "./groups-grid-empty";
import { GroupsGridLoading } from "./groups-grid-loading";

export function GroupsGrid() {
  const { groups, isGroupsLoading } = useHomeData();
  const { unreadItems: notifications } = useNotifications();
  const visibleGroups = getActiveGroupPreview(groups, 4);
  const unreadGroupIds = collectUnreadGroupIds(notifications, groups);

  if (isGroupsLoading && groups.length === 0) {
    return <GroupsGridLoading />;
  }

  return (
    <section
      aria-labelledby="groups-grid-heading"
      className="flex w-full flex-col gap-4"
    >
      <HomeSectionHeading
        id="groups-grid-heading"
        title="Active groups"
        description="The rooms with recent movement."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link {...buildActivityNavigation()}>View all</Link>
          </Button>
        }
      />

      <div role="list" aria-label="Your groups" className="flex flex-col">
        {visibleGroups.length > 0 ? (
          <>
            {visibleGroups.map((group, i) => (
              <GroupRow
                key={group.id}
                group={group}
                hasNotification={
                  unreadGroupIds.has(group.id) ||
                  (group.plan ? unreadGroupIds.has(group.plan.id) : false)
                }
                index={i}
              />
            ))}
            <BrowseGroupsRow delay={visibleGroups.length * 0.05 + 0.1} />
          </>
        ) : (
          <GroupsGridEmpty />
        )}
      </div>
    </section>
  );
}
