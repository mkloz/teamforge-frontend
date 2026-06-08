import { ActivityPageSkeleton } from "@/features/activity/components/activity-page/activity-page-skeleton";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";

export function ActivityPageLoading({ contained }: PageLoadingProps = {}) {
  return <ActivityPageSkeleton contained={contained} />;
}
