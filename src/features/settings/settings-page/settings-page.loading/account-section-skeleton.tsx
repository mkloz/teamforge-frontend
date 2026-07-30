import type { ReactNode } from "react";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

export function AccountSectionSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex min-w-0 flex-col gap-5">
        <SettingsCardSkeleton>
          <div className="flex items-center gap-4">
            <Skeleton shape="circle" className="size-20 shrink-0" tone="teal" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-6 w-40" />
              <SkeletonText
                className="mt-2 max-w-sm"
                lines={2}
                size="sm"
                widths={["w-full", "w-4/5"]}
              />
            </div>
          </div>

          <Skeleton className="mt-4 h-24 w-full rounded-lg" />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <SettingsFieldSkeleton />
            <SettingsFieldSkeleton />
          </div>
          <SettingsFieldSkeleton className="mt-5" inputClassName="h-24" />
        </SettingsCardSkeleton>

        <SettingsCardSkeleton>
          <div className="grid gap-5 sm:grid-cols-2">
            <SettingsFieldSkeleton />
            <SettingsFieldSkeleton />
          </div>
          <SettingsFieldSkeleton className="mt-6" />
          <Skeleton className="mt-4 h-16 w-full rounded-xl" />
        </SettingsCardSkeleton>

        <div className="rounded-3xl bg-card p-3 sm:p-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-3 w-80 max-w-full" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SkeletonButton className="h-11 w-full" />
            <SkeletonButton className="h-11 w-full" tone="teal" />
          </div>
        </div>
      </div>

      <div>
        <SettingsCardSkeleton>
          <Skeleton className="h-14 w-full rounded-xl" tone="teal" />
          <Skeleton className="mt-5 h-20 w-full rounded-xl" />
        </SettingsCardSkeleton>
      </div>
    </div>
  );
}

function SettingsCardSkeleton({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-card p-3 sm:p-6">
      <div>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-2 h-3 w-72 max-w-full" />
      </div>
      <div className="mt-4 sm:mt-6">{children}</div>
    </section>
  );
}

function SettingsFieldSkeleton({
  className,
  inputClassName,
}: {
  className?: string;
  inputClassName?: string;
}) {
  return (
    <div className={className}>
      <Skeleton className="h-3 w-20" />
      <Skeleton className={cn("mt-2 h-11 w-full rounded-lg", inputClassName)} />
    </div>
  );
}
