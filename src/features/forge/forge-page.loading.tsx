import {
  ForgeIntroContent,
  ForgePageShell,
} from "@/features/forge/forge-page-content";
import {
  GeneratedPageLoading,
  type PageLoadingProps,
} from "@/shared/components/loading/page-loading";

export const FORGE_PAGE_SKELETON_NAME = "forge.page";

const noop = () => {};

export function ForgePageLoading(_props: PageLoadingProps = {}) {
  const fixture = <ForgePageLoadingFixture />;

  return (
    <GeneratedPageLoading name={FORGE_PAGE_SKELETON_NAME} fixture={fixture}>
      {fixture}
    </GeneratedPageLoading>
  );
}

export function ForgePageLoadingFixture() {
  return (
    <ForgePageShell>
      <ForgeIntroContent onForgeClick={noop} />
    </ForgePageShell>
  );
}
