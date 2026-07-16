import { Skeleton } from "@/shared/components/ui/skeleton";

export function SafetyPageLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <div className="grid gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-full max-w-lg" />
      </div>
      <div className="flex gap-2">
        {["one", "two", "three"].map((item) => (
          <Skeleton key={item} className="h-10 w-32 rounded-full" />
        ))}
      </div>
      <div className="grid gap-3">
        {["first", "second", "third"].map((item) => (
          <Skeleton key={item} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function SafetyDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  );
}
