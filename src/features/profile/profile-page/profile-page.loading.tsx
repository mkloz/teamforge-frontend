import {
  GeneratedPageLoading,
  type PageLoadingProps,
} from "@/shared/components/loading/page-loading";

import { ProfilePageContent } from "./profile-page-content";
import {
  PROFILE_PAGE_SKELETON_NAME,
  profilePageSkeletonFixture,
} from "./profile-page-skeleton-fixture";

export function ProfilePageLoading(_props: PageLoadingProps = {}) {
  const fixture = <ProfilePageFixture />;

  return (
    <GeneratedPageLoading name={PROFILE_PAGE_SKELETON_NAME} fixture={fixture}>
      {fixture}
    </GeneratedPageLoading>
  );
}

export function ProfilePageFixture() {
  return (
    <ProfilePageContent
      profile={profilePageSkeletonFixture}
      showUserMenu={false}
    />
  );
}
