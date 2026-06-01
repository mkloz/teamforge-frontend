import { lazy, Suspense } from "react";
import { useHomeData } from "@/features/home/hooks/use-home-data";

import { GroupsGridView } from "./groups-grid-view";

const LazyGroupsGridChatStateLoader = lazy(() =>
  import("./groups-grid-chat-state-loader").then((module) => ({
    default: module.GroupsGridChatStateLoader,
  })),
);

export function GroupsGrid() {
  const { groups, isGroupsLoading } = useHomeData({
    include: {
      groups: true,
    },
  });

  return (
    <Suspense
      fallback={
        <GroupsGridView groups={groups} isGroupsLoading={isGroupsLoading} />
      }
    >
      <LazyGroupsGridChatStateLoader
        groups={groups}
        isGroupsLoading={isGroupsLoading}
      />
    </Suspense>
  );
}
