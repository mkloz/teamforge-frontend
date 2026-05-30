import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import { buildActivityNavigation } from "@/features/activity/lib/activity-route";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { HomeGroupsSkeleton } from "@/features/home/components/home-skeletons";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { getActiveGroupPreview } from "@/features/home/lib/home-insights";
import { Button } from "@/shared/components/ui/button";
import type { GroupApi } from "@/shared/schemas";

import { BrowseGroupsRow } from "./browse-groups-row";
import { collectGroupChatState } from "./group-chat-state";
import { GroupRow } from "./group-row";
import { GroupsGridEmpty } from "./groups-grid-empty";

export function GroupsGrid() {
  const { groups, isGroupsLoading } = useHomeData();
  const chatsQuery = useQuery(ActivityQueryFactory.chats());
  const groupChatState = collectGroupChatState(chatsQuery.data ?? []);

  return (
    <GroupsGridView
      groups={groups}
      groupChatState={groupChatState}
      isGroupsLoading={isGroupsLoading}
    />
  );
}

interface GroupsGridViewProps {
  groups: GroupApi[];
  groupChatState?: ReturnType<typeof collectGroupChatState>;
  isGroupsLoading?: boolean;
}

export function GroupsGridView({
  groups,
  groupChatState = collectGroupChatState([]),
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
        description="The rooms with recent movement."
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
