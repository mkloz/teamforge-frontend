import { SkeletonText } from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

const DEFAULT_FEATURE_TEXT_WIDTHS = ["w-full", "w-4/5"];

type SkeletonFeatureGridOptions = {
  gridClassName: string;
  itemClassName: string;
  items: readonly string[];
  textClassName?: string;
  textWidths?: string[];
  titleClassName?: string;
};

export function SkeletonFeatureGrid({
  gridClassName,
  itemClassName,
  items,
  textClassName = "mt-3",
  textWidths = DEFAULT_FEATURE_TEXT_WIDTHS,
  titleClassName = "h-5 w-36",
}: SkeletonFeatureGridOptions) {
  return (
    <div className={gridClassName}>
      {items.map((item) => (
        <div key={item} className={itemClassName}>
          <Skeleton className={titleClassName} tone="teal" />
          <SkeletonText
            className={textClassName}
            lines={2}
            widths={textWidths}
          />
        </div>
      ))}
    </div>
  );
}
