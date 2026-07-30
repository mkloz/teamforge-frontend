import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ActivityGroupChatState } from "@/features/activity/public/activity-group-chat-state";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { HomeGroupsSkeleton } from "@/features/home/components/home-skeletons";
import { getActiveGroupPreview } from "@/features/home/lib/home-insights";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import { Button } from "@/shared/components/ui/button";
import { GroupedMenuList } from "@/shared/components/ui/grouped-menu";
import { buildActivityNavigation } from "@/shared/navigation/activity-navigation";

import { GroupRow } from "./group-row";
import { GroupsGridEmpty } from "./groups-grid-empty";

const EMPTY_GROUP_CHAT_STATE: ActivityGroupChatState = {
  lastActivityByGroupId: new Map(),
  messagePreviewsByGroupId: new Map(),
  statusesByGroupId: new Map(),
  unreadCountsByGroupId: new Map(),
};

interface GroupsGridViewProps {
  groups: HomeGroup[];
  groupChatState?: ActivityGroupChatState;
  isGroupsLoading?: boolean;
}

export function GroupsGridView({
  groups,
  groupChatState = EMPTY_GROUP_CHAT_STATE,
  isGroupsLoading = false,
}: GroupsGridViewProps) {
  const visibleGroups = getActiveGroupPreview(groups, 4, {
    lastActivityByGroupId: groupChatState.lastActivityByGroupId,
    unreadCountsByGroupId: groupChatState.unreadCountsByGroupId,
  });

  if (isGroupsLoading && groups.length === 0) {
    return <HomeGroupsSkeleton />;
  }

  return (
    <section
      aria-labelledby="groups-grid-heading"
      className="flex w-full min-w-0 flex-col gap-5 lg:pr-10"
    >
      <HomeSectionHeading
        id="groups-grid-heading"
        title="Active groups"
        description="Latest updates and upcoming plans."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link {...buildActivityNavigation({ filter: "groups" })}>
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <GroupedMenuList aria-label="Your groups">
        {visibleGroups.length > 0 ? (
          visibleGroups.map((group) => {
            const unreadCount =
              groupChatState.unreadCountsByGroupId.get(group.id) ?? 0;
            const messagePreview = groupChatState.messagePreviewsByGroupId.get(
              group.id,
            );
            const status = groupChatState.statusesByGroupId.get(group.id);

            return (
              <GroupRow
                key={group.id}
                group={group}
                isMuted={status?.isMuted}
                isPinned={status?.isPinned}
                messagePreview={messagePreview}
                unreadCount={unreadCount}
              />
            );
          })
        ) : (
          <GroupsGridEmpty />
        )}
      </GroupedMenuList>
    </section>
  );
}
