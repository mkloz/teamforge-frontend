import { SkeletonText } from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function SettingsPreferencesSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-2">
      <output className="sr-only">Loading preferences</output>
      {["one", "two", "three", "four", "five"].map((item, index) => (
        <div
          key={item}
          className="flex w-full items-center justify-between gap-3 rounded-xl bg-muted/30 p-3 text-left sm:gap-4 sm:p-4"
        >
          <SkeletonText
            className="min-w-0 flex-1"
            lines={2}
            size="sm"
            widths={index % 2 === 0 ? ["w-40", "w-full"] : ["w-32", "w-5/6"]}
          />
          <Skeleton
            shape="pill"
            className="h-7 w-12 shrink-0"
            tone={index === 0 ? "teal" : "default"}
          />
        </div>
      ))}
    </div>
  );
}
