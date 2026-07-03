import { SECTION_PROGRESS_ITEMS } from "@/features/landing/landing-page.loading/constants";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function LandingLoadingProgress() {
  return (
    <div className="fixed top-1/2 left-6 z-100 hidden -translate-y-1/2 flex-col items-center gap-5 lg:flex">
      {SECTION_PROGRESS_ITEMS.map((item, index) => (
        <Skeleton
          key={item}
          shape="circle"
          className={index === 0 ? "size-2.5" : "size-1"}
          tone={index === 0 ? "teal" : "default"}
        />
      ))}
    </div>
  );
}
