import { Skeleton } from "@/shared/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-7 px-4 py-5 md:px-8 lg:grid-cols-[14rem_minmax(0,56rem)] lg:gap-8 lg:py-10">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-5">
        <Skeleton className="h-10 w-44 rounded-xl" />
        <Skeleton className="h-5 w-96 max-w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}
