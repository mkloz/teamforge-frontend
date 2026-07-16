import { Skeleton } from "@/shared/components/ui/skeleton";

export function SafetyDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-6 md:px-8 md:py-10">
      <Skeleton className="h-10 w-36" />
      <div className="mt-6 border-border border-b pb-6">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="mt-4 h-8 w-full max-w-md" />
        <Skeleton className="mt-2 h-4 w-full max-w-lg" />
      </div>
      {["first", "second"].map((item) => (
        <div key={item} className="border-border border-b py-6 last:border-b-0">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-5 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
