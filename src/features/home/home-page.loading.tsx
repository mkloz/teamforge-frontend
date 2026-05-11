import {
  HOME_PAGE_SKELETON_NAME,
  HomePageSkeletonFixture,
} from "@/features/home/home-page-skeleton-fixture";
import {
  GeneratedPageLoading,
  type PageLoadingProps,
} from "@/shared/components/loading/page-loading";

export function HomePageLoading(_props: PageLoadingProps = {}) {
  const fixture = <HomePageSkeletonFixture />;

  return (
    <GeneratedPageLoading name={HOME_PAGE_SKELETON_NAME} fixture={fixture}>
      {fixture}
    </GeneratedPageLoading>
  );
}
