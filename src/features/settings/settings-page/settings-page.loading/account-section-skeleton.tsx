import {
  FormGroupHeadingSkeleton,
  SettingsInputSkeleton,
} from "@/features/settings/settings-page/settings-page.loading/shared-skeletons";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function AccountSectionSkeleton() {
  return (
    <div className="flex flex-col gap-9">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-5">
            <Skeleton
              shape="circle"
              className="size-24 shrink-0 sm:size-28"
              tone="teal"
            />
            <div className="min-w-0 flex-1 pt-2">
              <Skeleton className="h-3 w-32" tone="teal" />
              <Skeleton className="mt-3 h-8 w-56 max-w-full" />
              <SkeletonText
                className="mt-3 max-w-md"
                lines={3}
                size="sm"
                widths={["w-full", "w-11/12", "w-3/4"]}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border border-dashed bg-card/35 p-4">
            <div className="flex items-center gap-4">
              <Skeleton shape="circle" className="size-10" tone="teal" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-64 max-w-full" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Skeleton shape="pill" className="h-6 w-20" />
                  <Skeleton shape="pill" className="h-6 w-40" />
                </div>
              </div>
              <SkeletonButton className="hidden h-8 w-20 sm:block" />
            </div>
          </div>

          <Skeleton className="h-4 w-80 max-w-full" />

          <div className="grid gap-3 sm:grid-cols-2">
            <SkeletonButton className="h-11 w-full" tone="teal" />
            <SkeletonButton className="h-11 w-full" tone="amber" />
          </div>
        </div>

        <div className="border-border border-y lg:border-y-0 lg:border-l lg:pl-6">
          {["email", "sign-in", "verification", "member-since"].map(
            (item, index) => (
              <div
                key={item}
                className="flex gap-3 border-border border-b py-4 last:border-b-0"
              >
                <Skeleton
                  shape="circle"
                  className="mt-0.5 size-8 shrink-0"
                  tone={index === 0 ? "teal" : "default"}
                />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton
                    className={
                      index === 0 ? "mt-2 h-4 w-full max-w-48" : "mt-2 h-4 w-28"
                    }
                  />
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="border-border border-t pt-6">
        <FormGroupHeadingSkeleton />
        <div className="mt-5 grid gap-x-5 gap-y-2 md:grid-cols-2">
          <SettingsInputSkeleton />
          <SettingsInputSkeleton />
          <SettingsInputSkeleton
            className="md:col-span-2"
            contentClassName="mt-1"
            fieldAlign="start"
            inputClassName="h-28"
          />
        </div>
      </section>

      <section className="border-border border-t pt-6">
        <FormGroupHeadingSkeleton titleWidth="w-44" />
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <SettingsInputSkeleton />
          <SettingsInputSkeleton />
        </div>
      </section>

      <section className="border-border border-t pt-6">
        <FormGroupHeadingSkeleton titleWidth="w-16" />
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
          <div>
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton shape="pill" className="h-5 w-28" />
            </div>
            <Skeleton className="mt-2 h-11 w-full rounded-xl" />
            <Skeleton className="mt-2 h-3 w-96 max-w-full" />
          </div>
          <div className="flex min-h-10 gap-3 border-border border-t pt-4 lg:mt-7 lg:items-center lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
            <Skeleton shape="circle" className="size-8 shrink-0" tone="teal" />
            <SkeletonText lines={2} size="sm" widths={["w-24", "w-20"]} />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 border-border border-t pt-5 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-4 w-80 max-w-full" />
        <div className="responsive-action-grid grid w-full gap-3 md:max-w-92">
          <SkeletonButton className="h-11 w-full" />
          <SkeletonButton className="h-11 w-full" tone="teal" />
        </div>
      </div>
    </div>
  );
}
