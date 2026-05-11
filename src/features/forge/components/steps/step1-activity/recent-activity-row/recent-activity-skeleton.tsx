import type { RecentActivityItem } from "@/features/forge/lib/recent-activity/types";
import { GeneratedSkeleton } from "@/shared/components/loading/generated-skeleton";
import { RecentActivityCard } from "./recent-activity-card";

export const RECENT_ACTIVITY_SKELETON_NAME = "forge.recent-activity";

const recentActivityFixtures = [
  {
    id: "recent-fixture-film",
    title: "Indie film night",
    categoryId: "ARTS",
    count: 4,
    lastUsedAt: "2026-05-10T18:30:00.000Z",
    template: {
      selectedActivity: "Indie film night",
      planName: "Friday screening",
      planDescription: "Watch something small and talk about it after.",
      planLocation: "Watershed",
      planLocationLat: null,
      planLocationLng: null,
      locationType: "IN_PERSON",
      planCost: "PAID",
      planCostAmount: "8",
      planCostDetails: "Cinema ticket",
      forgeMode: "AUTO",
      fixedSize: 5,
      visibility: "PUBLIC",
      groupName: "Indie Film Circle",
      groupDescription: "A thoughtful small cinema group.",
      coverImage: null,
      avatarImage: null,
    },
  },
  {
    id: "recent-fixture-climbing",
    title: "Bouldering",
    categoryId: "SPORTS",
    count: 2,
    lastUsedAt: "2026-05-09T12:00:00.000Z",
    template: {
      selectedActivity: "Bouldering",
      planName: "Sunday climbing",
      planDescription: "A low-pressure climbing session.",
      planLocation: "Bloc",
      planLocationLat: null,
      planLocationLng: null,
      locationType: "IN_PERSON",
      planCost: "PAID",
      planCostAmount: "12",
      planCostDetails: "Entry pass",
      forgeMode: "AUTO",
      fixedSize: 4,
      visibility: "PUBLIC",
      groupName: "Sunday Bouldering",
      groupDescription: "Climb first, coffee after.",
      coverImage: null,
      avatarImage: null,
    },
  },
  {
    id: "recent-fixture-design",
    title: "Design critique",
    categoryId: "TECH",
    count: 3,
    lastUsedAt: "2026-05-08T17:00:00.000Z",
    template: {
      selectedActivity: "Design critique",
      planName: "Product teardown night",
      planDescription: "Bring one thing and get clear feedback.",
      planLocation: "Online",
      planLocationLat: null,
      planLocationLng: null,
      locationType: "ONLINE",
      planCost: "FREE",
      planCostAmount: "",
      planCostDetails: "",
      forgeMode: "AUTO",
      fixedSize: 6,
      visibility: "PUBLIC",
      groupName: "Design Crit Circle",
      groupDescription: "Useful feedback without theatre.",
      coverImage: null,
      avatarImage: null,
    },
  },
] satisfies RecentActivityItem[];

const noop = () => undefined;

export function RecentActivitySkeleton() {
  return (
    <GeneratedSkeleton
      name={RECENT_ACTIVITY_SKELETON_NAME}
      loading
      fixture={<RecentActivitySkeletonFixture />}
    >
      <RecentActivitySkeletonFixture />
    </GeneratedSkeleton>
  );
}

function RecentActivitySkeletonFixture() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {recentActivityFixtures.map((activity) => (
        <RecentActivityCard
          key={activity.id}
          activity={activity}
          active={false}
          recommended={activity.categoryId === "TECH"}
          onTemplateToggle={noop}
        />
      ))}
    </div>
  );
}
