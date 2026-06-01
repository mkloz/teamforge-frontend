import { lazy, Suspense, useEffect, useState } from "react";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import {
  cancelDelay,
  cancelIdleTask,
  scheduleDelay,
  scheduleIdleTask,
} from "@/shared/lib/browser-scheduling";

import { GroupsGridView } from "./groups-grid-view";

const HOME_CHAT_STATE_DELAY_MS = 12_000;

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
  const shouldLoadChatState = useDeferredChatState();

  if (shouldLoadChatState) {
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

  return <GroupsGridView groups={groups} isGroupsLoading={isGroupsLoading} />;
}

function useDeferredChatState() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    let idleTask: ReturnType<typeof scheduleIdleTask> | undefined;
    const delayTask = scheduleDelay(() => {
      idleTask = scheduleIdleTask(() => {
        setShouldLoad(true);
      });
    }, HOME_CHAT_STATE_DELAY_MS);

    return () => {
      cancelDelay(delayTask);
      if (idleTask) {
        cancelIdleTask(idleTask);
      }
    };
  }, []);

  return shouldLoad;
}
