import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ActivityGroupChatState } from "@/features/activity/public/activity-group-chat-state";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { HomeGroupsSkeleton } from "@/features/home/components/home-skeletons";
import { getActiveGroupPreview } from "@/features/home/lib/home-insights";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import { Button } from "@/shared/components/ui/button";
import { buildActivityNavigation } from "@/shared/navigation/activity-navigation";

import { BrowseGroupsRow } from "./browse-groups-row";
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
      className="flex w-full flex-col gap-4"
    >
      <HomeSectionHeading
        id="groups-grid-heading"
        title="Active groups"
        action={
          <Button asChild variant="ghost" size="sm">
            <Link {...buildActivityNavigation({ filter: "groups" })}>
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <ul
        aria-label="Your groups"
        className="flex list-none flex-col gap-2 p-0"
      >
        {visibleGroups.length > 0 ? (
          <>
            {visibleGroups.map((group) => {
              const unreadCount =
                groupChatState.unreadCountsByGroupId.get(group.id) ?? 0;
              const lastActivityAt =
                groupChatState.lastActivityByGroupId.get(group.id) ??
                group.updatedAt;
              const messagePreview =
                groupChatState.messagePreviewsByGroupId.get(group.id);
              const status = groupChatState.statusesByGroupId.get(group.id);

              return (
                <GroupRow
                  key={group.id}
                  group={group}
                  isMuted={status?.isMuted}
                  isPinned={status?.isPinned}
                  lastActivityAt={lastActivityAt}
                  messagePreview={messagePreview}
                  unreadCount={unreadCount}
                />
              );
            })}
            <BrowseGroupsRow />
          </>
        ) : (
          <GroupsGridEmpty />
        )}
      </ul>
    </section>
  );
}
