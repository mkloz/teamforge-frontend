import type { SettingsSection } from "@/features/settings/lib/settings-route";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonCard,
  SkeletonList,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface SettingsPageLoadingProps extends PageLoadingProps {
  activeSection?: SettingsSection;
}

export function SettingsPageLoading({
  activeSection: _activeSection,
}: SettingsPageLoadingProps = {}) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading settings"
      className="lg:settings-page-grid mx-auto grid w-full max-w-6xl gap-7 px-4 py-5 md:px-8 lg:gap-12 lg:py-10 xl:gap-18"
      role="status"
    >
      <span className="sr-only">Loading settings</span>
      <aside className="lg:sticky lg:top-10 lg:self-start">
        <div className="mb-5 border-border border-b pb-5 lg:border-b-0 lg:pb-0">
          <SkeletonText lines={2} widths={["w-32", "w-64"]} />
        </div>
        <div className="flex flex-col gap-2">
          {["account", "appearance", "matching", "privacy", "security"].map(
            (item, index) => (
              <div
                key={item}
                className="flex items-center gap-3 px-1 py-2 lg:px-4"
              >
                <Skeleton
                  shape="circle"
                  className="size-8"
                  tone={index === 0 ? "teal" : "default"}
                />
                <SkeletonText
                  className="flex-1"
                  lines={2}
                  widths={["w-24", "w-36"]}
                />
              </div>
            ),
          )}
        </div>
        <div className="mt-5 border-border border-y py-4 lg:border-x-0 lg:border-t lg:border-b-0">
          <SkeletonButton className="h-10 w-full" />
        </div>
      </aside>

      <section className="w-full min-w-0 pt-11 lg:block lg:max-w-4xl lg:pt-0">
        <div className="mb-7 border-border border-b pb-5 lg:mb-9 lg:pb-7">
          <SkeletonText lines={3} widths={["w-24", "w-3/5", "w-full"]} />
        </div>
        <SkeletonCard className="p-5">
          <SkeletonText lines={2} widths={["w-36", "w-64"]} />
          <div className="mt-5">
            <SkeletonList count={4} />
          </div>
        </SkeletonCard>
      </section>
    </div>
  );
}
