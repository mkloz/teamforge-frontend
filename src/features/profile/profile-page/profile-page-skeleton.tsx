import { Skeleton } from "@/shared/components/ui/skeleton";

export function ProfilePageSkeleton() {
  return (
    <main className="relative min-h-full bg-canvas px-4 pb-32 pt-20 md:px-8 md:pb-0 md:pt-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex flex-2 flex-col gap-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-96 flex-1" />
        </div>
      </div>
    </main>
  );
}
