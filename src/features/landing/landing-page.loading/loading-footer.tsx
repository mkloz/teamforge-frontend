import { Skeleton } from "@/shared/components/ui/skeleton";

export function LandingLoadingFooter() {
  return (
    <footer className="bg-hero-bg px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 border-white/10 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-32" tone="teal" />
        <div className="flex gap-5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </footer>
  );
}
