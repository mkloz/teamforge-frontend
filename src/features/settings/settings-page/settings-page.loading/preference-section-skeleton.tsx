import {
  PreferenceRowSkeleton,
  SectionHeadingSkeleton,
} from "@/features/settings/settings-page/settings-page.loading/shared-skeletons";
import { SkeletonText } from "@/shared/components/loading/skeleton-patterns";

export function PreferenceSectionSkeleton() {
  return (
    <section className="flex flex-col gap-8">
      <SectionHeadingSkeleton />
      <div className="border-border border-t">
        {["first", "second", "third", "fourth"].map((item, index) => (
          <PreferenceRowSkeleton
            key={item}
            tone={index === 0 ? "teal" : "default"}
          />
        ))}
      </div>
      <div className="border-primary/35 border-l pl-4">
        <SkeletonText lines={2} size="sm" widths={["w-full", "w-3/4"]} />
      </div>
    </section>
  );
}
